// ============================================================================
// Breadcrumb Store - Reactive State Management with Signals
// ============================================================================
// PROPOSITO: Gestiona el estado de breadcrumbs usando Angular Signals.
//
// POR QUE usar Signals en lugar de BehaviorSubject:
// 1. PERFORMANCE: Signals tienen change detection granular
//    - BehaviorSubject: Marca todo el componente para check
//    - Signal: Solo actualiza bindings afectados
//
// 2. SIMPLICIDAD: No requiere manejo de suscripciones
//    - BehaviorSubject: Necesita takeUntil/unsubscribe (error-prone)
//    - Signal: Angular maneja el lifecycle automaticamente
//
// 3. SYNCHRONOUS: Lectura sincrona del valor actual
//    - BehaviorSubject: .getValue() es sincrono pero anti-pattern
//    - Signal: breadcrumbs() es la forma natural de leer
//
// 4. COMPUTED: Derivacion de estado declarativa
//    - BehaviorSubject: Requiere combineLatest/map (verbose)
//    - Signal: computed(() => ...) es simple y eficiente
//
// ARQUITECTURA - Store Pattern:
// - El Store es el UNICO owner del estado
// - Components LEEN via signals (readonly)
// - Solo el Store puede ESCRIBIR (encapsulacion)
// - Services externos notifican al Store que actualice
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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import {
  Breadcrumb,
  BreadcrumbRouteConfig,
  isBreadcrumbRouteConfig,
} from '../models/breadcrumb.model';

/**
 * Breadcrumb Store - Gestiona estado reactivo de breadcrumbs.
 *
 * COMO funciona internamente:
 * 1. Escucha NavigationEnd del Router
 * 2. Extrae snapshot de la ruta activa
 * 3. Recorre el arbol de rutas recursivamente
 * 4. Lee `data.breadcrumb` de cada nivel
 * 5. Construye array de Breadcrumb[]
 * 6. Actualiza el signal (dispara re-render)
 *
 * QUE aporta a la arquitectura:
 * - Single Source of Truth: Un lugar para breadcrumbs
 * - Reactive: Cambios se propagan automaticamente
 * - Testable: Estado predecible, facil de mockear
 * - Performant: Signals con granular updates
 */
@Injectable({
  providedIn: 'root',
})
export class BreadcrumbStore {
  // ============================================================================
  // Dependency Injection
  // ============================================================================

  /**
   * Router de Angular para escuchar navegacion.
   *
   * POR QUE inject() en lugar de constructor:
   * - Permite usar en computed/effect sin this
   * - Mas explicito sobre dependencias
   * - Pattern recomendado en Angular 14+
   */
  private readonly router = inject(Router);

  /**
   * DestroyRef para cleanup automatico.
   *
   * QUE es DestroyRef:
   * - Nuevo en Angular 16+
   * - Permite registrar callbacks de cleanup
   * - takeUntilDestroyed() lo usa internamente
   * - Reemplaza ngOnDestroy para suscripciones
   */
  private readonly destroyRef = inject(DestroyRef);

  // ============================================================================
  // State - Private WritableSignals
  // ============================================================================

  /**
   * Estado interno de breadcrumbs.
   *
   * POR QUE es private:
   * - Encapsulacion: Solo el store puede modificar
   * - Previene: component.breadcrumbs.set([]) (mutation externa)
   * - Pattern: Expose readonly, mutate internally
   */
  private readonly _breadcrumbs: WritableSignal<readonly Breadcrumb[]> = signal(
    []
  );

  /**
   * Estado de carga (para UI).
   */
  private readonly _isLoading: WritableSignal<boolean> = signal(true);

  // ============================================================================
  // Public Readonly Signals - Expose to Components
  // ============================================================================

  /**
   * Breadcrumbs actuales (readonly para consumers).
   *
   * COMO se usa en componentes:
   * ```typescript
   * // En el componente
   * breadcrumbs = inject(BreadcrumbStore).breadcrumbs;
   *
   * // En el template
   * @for (crumb of breadcrumbs(); track crumb.url) { ... }
   * ```
   *
   * POR QUE .asReadonly():
   * - Retorna Signal<T> en lugar de WritableSignal<T>
   * - Compile-time protection contra .set() externos
   * - Documenta intencion: esto es de solo lectura
   */
  public readonly breadcrumbs: Signal<readonly Breadcrumb[]> =
    this._breadcrumbs.asReadonly();

  /**
   * Estado de carga (readonly).
   */
  public readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  // ============================================================================
  // Computed Signals - Derived State
  // ============================================================================

  /**
   * Breadcrumb activo actual (el ultimo).
   *
   * POR QUE computed():
   * - Se recalcula automaticamente cuando breadcrumbs cambia
   * - Memorizado: No recalcula si breadcrumbs no cambio
   * - Lazy: Solo calcula cuando se lee
   *
   * COMO funciona computed() internamente:
   * - Angular trackea que signals se leen dentro
   * - Cuando esos signals cambian, marca computed como "dirty"
   * - Proximo acceso recalcula y cachea
   */
  public readonly activeBreadcrumb: Signal<Breadcrumb | null> = computed(() => {
    const crumbs = this._breadcrumbs();
    return crumbs.length > 0 ? crumbs[crumbs.length - 1] : null;
  });

  /**
   * Indica si hay breadcrumbs para mostrar.
   */
  public readonly hasBreadcrumbs: Signal<boolean> = computed(
    () => this._breadcrumbs().length > 0
  );

  /**
   * Numero de niveles de navegacion.
   */
  public readonly depth: Signal<number> = computed(
    () => this._breadcrumbs().length
  );

  /**
   * Breadcrumbs navegables (todos excepto el activo).
   *
   * QUE aporta:
   * - El ultimo breadcrumb no es clickeable (ya estas ahi)
   * - Este computed filtra automaticamente
   * - UI no necesita logica de filtrado
   */
  public readonly navigableBreadcrumbs: Signal<readonly Breadcrumb[]> =
    computed(() => {
      const crumbs = this._breadcrumbs();
      // Todos excepto el ultimo (que es el activo)
      return crumbs.slice(0, -1);
    });

  // ============================================================================
  // Constructor - Initialize Router Subscription
  // ============================================================================

  constructor() {
    this.initializeRouterSubscription();
  }

  // ============================================================================
  // Private Methods - Internal Logic
  // ============================================================================

  /**
   * Inicializa la suscripcion al Router.
   *
   * POR QUE en metodo separado:
   * - Constructor limpio y declarativo
   * - Logica de inicializacion aislada
   * - Facil de testear/mockear
   *
   * COMO funciona takeUntilDestroyed:
   * - Registra un callback en DestroyRef
   * - Cuando el servicio se destruye, completa el observable
   * - Para servicios root: Cuando la app se destruye
   * - Previene memory leaks automaticamente
   */
  private initializeRouterSubscription(): void {
    // Convertir eventos de navegacion a signal
    // toSignal() es la forma moderna de conectar RxJS con Signals
    this.router.events
      .pipe(
        // Solo eventos de navegacion completada
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),

        // Extraer snapshot de la ruta raiz
        map(() => this.router.routerState.snapshot.root),

        // Auto-cleanup cuando el store se destruye
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((rootSnapshot) => {
        this._isLoading.set(true);

        // Construir breadcrumbs desde el arbol de rutas
        const breadcrumbs = this.buildBreadcrumbsFromRoute(rootSnapshot);

        // Actualizar estado
        this._breadcrumbs.set(breadcrumbs);
        this._isLoading.set(false);
      });

    // Procesar ruta inicial (ya estamos en una pagina)
    const initialBreadcrumbs = this.buildBreadcrumbsFromRoute(
      this.router.routerState.snapshot.root
    );
    this._breadcrumbs.set(initialBreadcrumbs);
    this._isLoading.set(false);
  }

  /**
   * Construye breadcrumbs recursivamente desde el snapshot de ruta.
   *
   * ALGORITMO:
   * 1. Empezar en ruta raiz
   * 2. Para cada nivel, leer data.breadcrumb
   * 3. Si existe y no skip, agregar al array
   * 4. Resolver label (string o funcion)
   * 5. Continuar con firstChild recursivamente
   * 6. Marcar ultimo como activo
   *
   * POR QUE recursivo:
   * - El arbol de rutas es una estructura recursiva natural
   * - Cada nivel puede tener config o no (skip)
   * - Clean y declarativo
   *
   * @param route - Snapshot de la ruta actual
   * @param url - URL acumulada hasta este punto
   * @param breadcrumbs - Array de breadcrumbs construido hasta ahora
   * @returns Array completo de breadcrumbs
   */
  private buildBreadcrumbsFromRoute(
    route: ActivatedRouteSnapshot,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    // Agregar Home como primer breadcrumb si no existe
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({
        label: 'Home',
        url: '/',
        icon: 'home',
        isActive: false,
      });
    }

    // Construir URL del segmento actual
    const routeUrl = route.url.map((segment) => segment.path).join('/');
    if (routeUrl) {
      url += `/${routeUrl}`;
    }

    // Leer configuracion de breadcrumb desde data
    const breadcrumbConfig = route.data['breadcrumb'];

    // Si existe configuracion valida y no esta marcada para skip
    if (isBreadcrumbRouteConfig(breadcrumbConfig) && !breadcrumbConfig.skip) {
      // Resolver label (puede ser string o funcion)
      const label = this.resolveLabel(breadcrumbConfig.label, route.params);

      breadcrumbs.push({
        label,
        url,
        icon: breadcrumbConfig.icon,
        isActive: false, // Se actualizara al final
      });
    }
    // Soporte para config simplificada (solo string)
    else if (typeof breadcrumbConfig === 'string') {
      breadcrumbs.push({
        label: breadcrumbConfig,
        url,
        isActive: false,
      });
    }

    // Recursion: Procesar hijo si existe
    if (route.firstChild) {
      return this.buildBreadcrumbsFromRoute(route.firstChild, url, breadcrumbs);
    }

    // Caso base: No hay mas hijos, marcar ultimo como activo
    if (breadcrumbs.length > 0) {
      const lastIndex = breadcrumbs.length - 1;
      breadcrumbs[lastIndex] = {
        ...breadcrumbs[lastIndex],
        isActive: true,
      };
    }

    return breadcrumbs;
  }

  /**
   * Resuelve el label del breadcrumb.
   *
   * POR QUE separar esta logica:
   * - Single Responsibility: Solo resolucion de labels
   * - Permite labels dinamicos con params
   * - Facil de extender (ej: i18n, async)
   *
   * @param label - String estatico o funcion
   * @param params - Parametros de ruta (ej: { id: '123' })
   * @returns Label resuelto como string
   */
  private resolveLabel(
    label: string | ((params: Record<string, string>) => string),
    params: Record<string, string>
  ): string {
    if (typeof label === 'function') {
      return label(params);
    }
    return label;
  }

  // ============================================================================
  // Public Methods - For Testing and Special Cases
  // ============================================================================

  /**
   * Fuerza reconstruccion de breadcrumbs.
   * Util despues de cambios de autenticacion o idioma.
   */
  public refresh(): void {
    const breadcrumbs = this.buildBreadcrumbsFromRoute(
      this.router.routerState.snapshot.root
    );
    this._breadcrumbs.set(breadcrumbs);
  }

  /**
   * Resetea el store al estado inicial.
   * Util para testing.
   */
  public reset(): void {
    this._breadcrumbs.set([]);
    this._isLoading.set(false);
  }
}
