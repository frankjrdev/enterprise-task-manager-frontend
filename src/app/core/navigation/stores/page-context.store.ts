// ============================================================================
// Page Context Store - Reactive Page State with Signals
// ============================================================================
// PROPOSITO: Gestiona el contexto de la pagina actual usando Angular Signals.
//
// DIFERENCIA con BreadcrumbStore:
// - BreadcrumbStore: Navegacion (donde estoy)
// - PageContextStore: Contexto de UI (que puedo hacer aqui)
//
// POR QUE stores separados:
// - Single Responsibility: Cada store maneja un aspecto
// - Granularidad: Componentes suscriben solo a lo que necesitan
// - Testing: Stores pequenos = tests simples
// - Performance: Updates independientes = menos re-renders
//
// ARQUITECTURA - Clean Architecture Layer:
// - Este store pertenece a la capa de APPLICATION
// - Coordina entre DOMAIN (modelos) e INFRASTRUCTURE (Router)
// - Components (PRESENTATION) solo consumen signals
// ============================================================================

import {
  Injectable,
  computed,
  signal,
  Signal,
  WritableSignal,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import {
  PageContext,
  PageContextRouteConfig,
  SearchState,
  createPageContext,
  DEFAULT_PAGE_CONTEXT,
  isPageContextRouteConfig,
} from '../models/page-context.model';

/**
 * Page Context Store - Gestiona estado de contexto de pagina.
 *
 * RESPONSABILIDADES:
 * 1. Extraer contexto de la ruta activa
 * 2. Mantener estado de busqueda
 * 3. Exponer signals para UI
 * 4. Coordinar cambios de pagina
 *
 * QUE NO HACE (por SRP):
 * - No ejecuta busquedas (delegado a SearchService)
 * - No construye breadcrumbs (delegado a BreadcrumbStore)
 * - No maneja autenticacion
 */
@Injectable({
  providedIn: 'root',
})
export class PageContextStore {
  // ============================================================================
  // Dependency Injection
  // ============================================================================

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // ============================================================================
  // State - Private WritableSignals
  // ============================================================================

  /**
   * Contexto de pagina actual.
   *
   * INMUTABILIDAD:
   * - Cada cambio de pagina crea nuevo objeto PageContext
   * - Signals detectan cambios por referencia
   * - Previene mutaciones accidentales
   */
  private readonly _context: WritableSignal<PageContext> = signal(
    DEFAULT_PAGE_CONTEXT
  );

  /**
   * Estado de busqueda.
   *
   * SEPARADO de context porque:
   * - Query cambia con cada keystroke (alta frecuencia)
   * - Context cambia con navegacion (baja frecuencia)
   * - Signals separados = updates granulares
   */
  private readonly _searchState: WritableSignal<SearchState> = signal({
    query: '',
    isSearching: false,
    results: [],
    error: null,
  });

  // ============================================================================
  // Public Readonly Signals - Page Context
  // ============================================================================

  /**
   * Contexto de pagina completo (readonly).
   */
  public readonly context: Signal<PageContext> = this._context.asReadonly();

  /**
   * Titulo de la pagina actual.
   *
   * POR QUE computed separado:
   * - Componentes que solo necesitan titulo no re-renderizan por otros cambios
   * - Permite usar directamente en template: {{ pageTitle() }}
   */
  public readonly pageTitle: Signal<string> = computed(
    () => this._context().pageTitle
  );

  /**
   * ID de pagina (ruta normalizada).
   */
  public readonly pageId: Signal<string> = computed(
    () => this._context().pageId
  );

  /**
   * Placeholder de busqueda.
   */
  public readonly searchPlaceholder: Signal<string> = computed(
    () => this._context().searchPlaceholder
  );

  /**
   * Indica si la busqueda esta habilitada.
   */
  public readonly searchEnabled: Signal<boolean> = computed(
    () => this._context().searchEnabled
  );

  /**
   * Metadata de la pagina.
   */
  public readonly metadata: Signal<Readonly<Record<string, unknown>> | undefined> =
    computed(() => this._context().metadata);

  // ============================================================================
  // Public Readonly Signals - Search State
  // ============================================================================

  /**
   * Query de busqueda actual.
   */
  public readonly searchQuery: Signal<string> = computed(
    () => this._searchState().query
  );

  /**
   * Indica si hay busqueda en progreso.
   */
  public readonly isSearching: Signal<boolean> = computed(
    () => this._searchState().isSearching
  );

  /**
   * Resultados de busqueda.
   */
  public readonly searchResults: Signal<readonly unknown[]> = computed(
    () => this._searchState().results
  );

  /**
   * Error de busqueda.
   */
  public readonly searchError: Signal<string | null> = computed(
    () => this._searchState().error
  );

  /**
   * Indica si hay query de busqueda activo.
   */
  public readonly hasActiveSearch: Signal<boolean> = computed(
    () => this._searchState().query.trim().length > 0
  );

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor() {
    this.initializeRouterSubscription();
  }

  // ============================================================================
  // Private Methods - Initialization
  // ============================================================================

  /**
   * Inicializa suscripcion al Router.
   *
   * PATRON: Reactive Router Integration
   * - Router emite eventos (Observable)
   * - Store transforma a estado (Signal)
   * - UI consume estado reactivamente
   */
  private initializeRouterSubscription(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => ({
          url: event.urlAfterRedirects,
          snapshot: this.router.routerState.snapshot.root,
        })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ url, snapshot }) => {
        // Extraer contexto de la ruta
        const context = this.buildContextFromRoute(snapshot, url);
        this._context.set(context);

        // Limpiar busqueda al cambiar de pagina
        this.clearSearch();
      });

    // Procesar ruta inicial
    const initialUrl = this.router.url;
    const initialSnapshot = this.router.routerState.snapshot.root;
    const initialContext = this.buildContextFromRoute(initialSnapshot, initialUrl);
    this._context.set(initialContext);
  }

  /**
   * Construye PageContext desde la ruta activa.
   *
   * ALGORITMO:
   * 1. Navegar al nodo hoja del arbol de rutas
   * 2. Leer data.pageContext si existe
   * 3. Fusionar con defaults
   * 4. Retornar PageContext inmutable
   *
   * POR QUE buscar en hoja:
   * - La hoja es la pagina actual especifica
   * - Padres son layouts/contenedores
   * - Config en hoja tiene precedencia
   */
  private buildContextFromRoute(
    route: ActivatedRouteSnapshot,
    url: string
  ): PageContext {
    // Navegar hasta la hoja (ruta mas profunda)
    let currentRoute = route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    // Leer configuracion de contexto
    const routeConfig = currentRoute.data['pageContext'];

    // Si hay configuracion valida, usarla
    if (isPageContextRouteConfig(routeConfig)) {
      return createPageContext({
        pageTitle: routeConfig.title,
        pageId: url,
        searchPlaceholder: routeConfig.searchPlaceholder ?? 'Search...',
        searchEnabled: !routeConfig.searchDisabled,
        metadata: routeConfig.metadata,
      });
    }

    // Fallback: Usar breadcrumb label como titulo si existe
    const breadcrumbLabel = currentRoute.data['breadcrumb'];
    if (typeof breadcrumbLabel === 'string') {
      return createPageContext({
        pageTitle: breadcrumbLabel,
        pageId: url,
      });
    }

    // Default
    return createPageContext({
      pageTitle: 'Dashboard',
      pageId: url,
    });
  }

  // ============================================================================
  // Public Methods - Search State Management
  // ============================================================================

  /**
   * Actualiza el query de busqueda.
   *
   * COMO se usa:
   * ```typescript
   * // En componente
   * onSearchInput(query: string) {
   *   this.pageContextStore.setSearchQuery(query);
   * }
   * ```
   *
   * QUE hace:
   * - Actualiza signal de query
   * - NO ejecuta busqueda (delegado a SearchService)
   * - Separation of Concerns: Store = estado, Service = logica
   */
  public setSearchQuery(query: string): void {
    this._searchState.update((state) => ({
      ...state,
      query,
    }));
  }

  /**
   * Indica inicio de busqueda.
   * Llamado por SearchService al iniciar request.
   */
  public setSearching(isSearching: boolean): void {
    this._searchState.update((state) => ({
      ...state,
      isSearching,
    }));
  }

  /**
   * Actualiza resultados de busqueda.
   * Llamado por SearchService al recibir respuesta.
   */
  public setSearchResults(results: readonly unknown[]): void {
    this._searchState.update((state) => ({
      ...state,
      results,
      isSearching: false,
      error: null,
    }));
  }

  /**
   * Establece error de busqueda.
   * Llamado por SearchService en caso de error.
   */
  public setSearchError(error: string): void {
    this._searchState.update((state) => ({
      ...state,
      error,
      isSearching: false,
      results: [],
    }));
  }

  /**
   * Limpia el estado de busqueda.
   * Llamado al cambiar de pagina o manualmente.
   */
  public clearSearch(): void {
    this._searchState.set({
      query: '',
      isSearching: false,
      results: [],
      error: null,
    });
  }

  // ============================================================================
  // Public Methods - For Testing
  // ============================================================================

  /**
   * Establece contexto manualmente.
   * Util para testing o casos especiales.
   */
  public setContext(context: PageContext): void {
    this._context.set(context);
  }

  /**
   * Resetea al estado inicial.
   */
  public reset(): void {
    this._context.set(DEFAULT_PAGE_CONTEXT);
    this.clearSearch();
  }
}
