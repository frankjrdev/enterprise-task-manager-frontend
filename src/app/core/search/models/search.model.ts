// ============================================================================
// Search Models - Interface Definitions
// ============================================================================
// PROPOSITO: Define tipos para el sistema de busqueda desacoplado.
//
// ARQUITECTURA - Strategy Pattern + Registry Pattern:
// - SearchHandler: Estrategia de busqueda por pagina
// - SearchRegistry: Registro de handlers disponibles
// - SearchDispatcher: Coordina busquedas usando el registry
//
// POR QUE este patron:
// - Open/Closed Principle: Agregar handlers sin modificar core
// - Loose coupling: Features registran sus handlers
// - Testable: Handlers se testean aislados
// - Scalable: N paginas = N handlers independientes
// ============================================================================

import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

/**
 * Resultado de busqueda generico.
 * Cada feature puede extender con propiedades especificas.
 */
export interface SearchResult {
  /**
   * ID unico del resultado.
   */
  readonly id: string;

  /**
   * Titulo/nombre principal del resultado.
   */
  readonly title: string;

  /**
   * Descripcion o preview del contenido.
   */
  readonly description?: string;

  /**
   * Tipo de resultado para icono/estilo.
   */
  readonly type: string;

  /**
   * URL de navegacion al seleccionar.
   */
  readonly url: string;

  /**
   * Icono Material para el resultado.
   */
  readonly icon?: string;

  /**
   * Metadata adicional especifica del tipo.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Parametros de busqueda.
 */
export interface SearchParams {
  /**
   * Query de busqueda.
   */
  readonly query: string;

  /**
   * ID de la pagina donde se ejecuta la busqueda.
   */
  readonly pageId: string;

  /**
   * Limite de resultados (paginacion).
   */
  readonly limit?: number;

  /**
   * Offset para paginacion.
   */
  readonly offset?: number;

  /**
   * Filtros adicionales especificos de pagina.
   */
  readonly filters?: Readonly<Record<string, unknown>>;
}

/**
 * Respuesta de busqueda.
 */
export interface SearchResponse<T extends SearchResult = SearchResult> {
  /**
   * Resultados de busqueda.
   */
  readonly results: readonly T[];

  /**
   * Total de resultados (para paginacion).
   */
  readonly total: number;

  /**
   * Query que produjo estos resultados.
   */
  readonly query: string;

  /**
   * Tiempo de ejecucion en ms.
   */
  readonly executionTimeMs: number;
}

/**
 * Interface para handlers de busqueda.
 *
 * PATRON - Strategy:
 * - Cada pagina implementa su estrategia de busqueda
 * - El dispatcher selecciona handler por pageId
 * - Nuevas paginas = nuevos handlers (OCP)
 *
 * COMO implementar:
 * ```typescript
 * @Injectable()
 * export class ProjectsSearchHandler implements SearchHandler {
 *   readonly pageId = '/dashboard/projects';
 *
 *   search(params: SearchParams): Observable<SearchResponse> {
 *     return this.projectsService.search(params.query);
 *   }
 * }
 * ```
 */
export interface SearchHandler<T extends SearchResult = SearchResult> {
  /**
   * ID de pagina que maneja este handler.
   * Debe coincidir con pageId del PageContextStore.
   */
  readonly pageId: string;

  /**
   * Nombre descriptivo del handler (para debugging).
   */
  readonly name?: string;

  /**
   * Ejecuta la busqueda.
   *
   * @param params - Parametros de busqueda
   * @returns Observable con respuesta de busqueda
   */
  search(params: SearchParams): Observable<SearchResponse<T>>;

  /**
   * Valida si el handler puede manejar esta busqueda.
   * Por defecto, verifica coincidencia de pageId.
   *
   * @param pageId - ID de pagina
   * @returns true si puede manejar
   */
  canHandle?(pageId: string): boolean;
}

/**
 * Injection token para registrar handlers.
 *
 * COMO se usa:
 * ```typescript
 * // En el feature module o routes
 * providers: [
 *   {
 *     provide: SEARCH_HANDLER,
 *     useClass: ProjectsSearchHandler,
 *     multi: true
 *   }
 * ]
 * ```
 *
 * POR QUE multi: true:
 * - Permite multiples providers con el mismo token
 * - Cada feature registra su handler
 * - El registry los colecta todos
 */
export const SEARCH_HANDLER = new InjectionToken<SearchHandler[]>(
  'SearchHandlers'
);

/**
 * Opciones de busqueda para el dispatcher.
 */
export interface SearchOptions {
  /**
   * Debounce time en ms.
   * Default: 300ms
   */
  readonly debounceMs?: number;

  /**
   * Minimo de caracteres para buscar.
   * Default: 2
   */
  readonly minQueryLength?: number;

  /**
   * Cancelar busqueda anterior si hay nueva.
   * Default: true (switchMap behavior)
   */
  readonly cancelPrevious?: boolean;
}

/**
 * Defaults para opciones de busqueda.
 */
export const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  debounceMs: 300,
  minQueryLength: 2,
  cancelPrevious: true,
};

/**
 * Factory para crear SearchParams con defaults.
 */
export function createSearchParams(
  partial: Partial<SearchParams> & Pick<SearchParams, 'query' | 'pageId'>
): SearchParams {
  return {
    query: partial.query,
    pageId: partial.pageId,
    limit: partial.limit ?? 10,
    offset: partial.offset ?? 0,
    filters: partial.filters,
  };
}

/**
 * Factory para crear SearchResponse vacia.
 */
export function createEmptySearchResponse(query: string): SearchResponse {
  return {
    results: [],
    total: 0,
    query,
    executionTimeMs: 0,
  };
}
