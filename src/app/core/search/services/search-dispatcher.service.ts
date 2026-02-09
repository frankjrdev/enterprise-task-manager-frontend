// ============================================================================
// Search Dispatcher Service - Coordinates Search Across Features
// ============================================================================
// PROPOSITO: Coordina busquedas despachando a handlers registrados.
//
// PATRON - Mediator + Strategy:
// - Mediator: Coordina entre UI y handlers
// - Strategy: Handlers implementan estrategias especificas
//
// POR QUE separar del PageContextStore:
// - Single Responsibility: Store = estado, Dispatcher = logica
// - Testable: Dispatcher se testea con mocks de handlers
// - Reusable: Mismo dispatcher para busqueda global y por pagina
//
// FLUJO:
// 1. UI llama dispatch(query)
// 2. Dispatcher encuentra handler por pageId
// 3. Handler ejecuta busqueda
// 4. Dispatcher actualiza PageContextStore
// 5. UI reactivamente muestra resultados
// ============================================================================

import {
  Injectable,
  inject,
  DestroyRef,
  Optional,
  Inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  of,
  EMPTY,
  catchError,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  tap,
  map,
  startWith,
} from 'rxjs';

import { PageContextStore } from '../../navigation/stores/page-context.store';
import {
  SearchHandler,
  SearchParams,
  SearchResponse,
  SearchOptions,
  SEARCH_HANDLER,
  DEFAULT_SEARCH_OPTIONS,
  createSearchParams,
  createEmptySearchResponse,
} from '../models/search.model';

/**
 * Search Dispatcher - Coordina busquedas entre features.
 *
 * RESPONSABILIDADES:
 * 1. Mantener registro de handlers
 * 2. Despachar queries al handler correcto
 * 3. Manejar debounce y cancelacion
 * 4. Actualizar estado en PageContextStore
 * 5. Manejar errores gracefully
 *
 * COMO se usa:
 * ```typescript
 * // En componente
 * onSearchInput(query: string) {
 *   this.searchDispatcher.dispatch(query);
 * }
 *
 * // Resultados via PageContextStore.searchResults signal
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class SearchDispatcher {
  // ============================================================================
  // Dependency Injection
  // ============================================================================

  private readonly destroyRef = inject(DestroyRef);
  private readonly pageContextStore = inject(PageContextStore);

  /**
   * Handlers inyectados via multi-provider.
   *
   * COMO funciona @Optional() @Inject():
   * - @Optional(): No falla si no hay providers
   * - @Inject(token): Inyecta valor del token
   * - multi: true: Retorna array de todos los providers
   *
   * Si no hay handlers registrados, será null/undefined.
   */
  private readonly injectedHandlers: SearchHandler[] = [];

  // ============================================================================
  // Internal State
  // ============================================================================

  /**
   * Mapa de handlers por pageId para O(1) lookup.
   */
  private readonly handlersMap = new Map<string, SearchHandler>();

  /**
   * Subject para disparar busquedas.
   *
   * POR QUE Subject y no signal:
   * - Necesitamos operadores RxJS (debounce, switchMap)
   * - Subject es la entrada, resultado va a signal
   * - Bridge entre imperativo (input) y reactivo (resultado)
   */
  private readonly searchSubject = new Subject<string>();

  /**
   * Opciones de busqueda actuales.
   */
  private options: Required<SearchOptions> = DEFAULT_SEARCH_OPTIONS;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(
    @Optional()
    @Inject(SEARCH_HANDLER)
    handlers: SearchHandler[] | null
  ) {
    // Registrar handlers inyectados
    if (handlers) {
      this.injectedHandlers = handlers;
      handlers.forEach((h) => this.registerHandler(h));
    }

    // Inicializar pipeline de busqueda
    this.initializeSearchPipeline();
  }

  // ============================================================================
  // Public Methods - Handler Registration
  // ============================================================================

  /**
   * Registra un handler de busqueda.
   *
   * CUANDO usar:
   * - Lazy loaded features que registran al inicializar
   * - Testing para registrar mocks
   *
   * @param handler - Handler a registrar
   */
  public registerHandler(handler: SearchHandler): void {
    if (this.handlersMap.has(handler.pageId)) {
      console.warn(
        `[SearchDispatcher] Handler for pageId "${handler.pageId}" already registered. Overwriting.`
      );
    }
    this.handlersMap.set(handler.pageId, handler);
  }

  /**
   * Desregistra un handler.
   *
   * @param pageId - ID de pagina del handler a remover
   */
  public unregisterHandler(pageId: string): void {
    this.handlersMap.delete(pageId);
  }

  /**
   * Obtiene handler para un pageId.
   *
   * @param pageId - ID de pagina
   * @returns Handler o undefined
   */
  public getHandler(pageId: string): SearchHandler | undefined {
    return this.handlersMap.get(pageId);
  }

  /**
   * Verifica si hay handler para un pageId.
   */
  public hasHandler(pageId: string): boolean {
    return this.handlersMap.has(pageId);
  }

  // ============================================================================
  // Public Methods - Search Dispatch
  // ============================================================================

  /**
   * Despacha una busqueda.
   *
   * FLUJO:
   * 1. Actualiza query en store
   * 2. Emite en subject (dispara pipeline)
   * 3. Pipeline aplica debounce
   * 4. Busca handler por pageId actual
   * 5. Ejecuta busqueda
   * 6. Actualiza resultados en store
   *
   * @param query - Query de busqueda
   */
  public dispatch(query: string): void {
    // Actualizar query inmediatamente (UI responsiva)
    this.pageContextStore.setSearchQuery(query);

    // Disparar pipeline de busqueda
    this.searchSubject.next(query);
  }

  /**
   * Limpia busqueda actual.
   */
  public clear(): void {
    this.pageContextStore.clearSearch();
    this.searchSubject.next('');
  }

  /**
   * Configura opciones de busqueda.
   *
   * @param options - Opciones a aplicar
   */
  public configure(options: Partial<SearchOptions>): void {
    this.options = { ...this.options, ...options };
    // Nota: Cambiar opciones requiere reinicializar pipeline
    // Para simplicidad, asumimos que se configura antes de usar
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Inicializa el pipeline de busqueda con RxJS.
   *
   * PIPELINE:
   * query$ -> debounce -> distinct -> filter(minLength) -> switchMap(search) -> results$
   *
   * POR QUE switchMap:
   * - Cancela busqueda anterior si hay nueva
   * - Evita race conditions
   * - Solo el resultado mas reciente importa
   */
  private initializeSearchPipeline(): void {
    this.searchSubject
      .pipe(
        // Debounce para no buscar en cada keystroke
        debounceTime(this.options.debounceMs),

        // Solo si el query cambio
        distinctUntilChanged(),

        // Filtrar queries muy cortos
        tap((query) => {
          if (query.length > 0 && query.length < this.options.minQueryLength) {
            // Query muy corto, limpiar resultados sin buscar
            this.pageContextStore.setSearchResults([]);
          }
        }),

        // Solo buscar si cumple minimo
        filter((query) => {
          if (query.length === 0) {
            // Query vacio = limpiar
            this.pageContextStore.clearSearch();
            return false;
          }
          return query.length >= this.options.minQueryLength;
        }),

        // Ejecutar busqueda (switchMap cancela anterior)
        switchMap((query) => this.executeSearch(query)),

        // Auto-cleanup
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.pageContextStore.setSearchResults(response.results);
        },
        error: (error) => {
          console.error('[SearchDispatcher] Pipeline error:', error);
          this.pageContextStore.setSearchError('Search failed');
        },
      });
  }

  /**
   * Ejecuta la busqueda con el handler apropiado.
   *
   * @param query - Query de busqueda
   * @returns Observable con respuesta
   */
  private executeSearch(query: string): Observable<SearchResponse> {
    const pageId = this.pageContextStore.pageId();

    // Buscar handler
    const handler = this.findHandler(pageId);

    if (!handler) {
      console.warn(
        `[SearchDispatcher] No handler found for pageId "${pageId}"`
      );
      return of(createEmptySearchResponse(query));
    }

    // Indicar que estamos buscando
    this.pageContextStore.setSearching(true);

    // Crear params
    const params = createSearchParams({ query, pageId });

    // Ejecutar busqueda
    return handler.search(params).pipe(
      catchError((error) => {
        console.error(`[SearchDispatcher] Search error for "${pageId}":`, error);
        this.pageContextStore.setSearchError(
          error.message || 'Search failed'
        );
        return of(createEmptySearchResponse(query));
      })
    );
  }

  /**
   * Encuentra handler para pageId.
   *
   * LOGICA:
   * 1. Busqueda exacta por pageId
   * 2. Si handler tiene canHandle(), usarlo
   * 3. Fallback a null si no hay match
   */
  private findHandler(pageId: string): SearchHandler | null {
    // Busqueda exacta
    const exactMatch = this.handlersMap.get(pageId);
    if (exactMatch) {
      return exactMatch;
    }

    // Buscar handler que pueda manejar (canHandle)
    for (const handler of this.handlersMap.values()) {
      if (handler.canHandle?.(pageId)) {
        return handler;
      }
    }

    return null;
  }
}
