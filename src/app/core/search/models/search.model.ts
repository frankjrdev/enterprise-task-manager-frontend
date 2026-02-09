import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export interface SearchResult {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly type: string;
  readonly url: string;
  readonly icon?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface SearchParams {
  readonly query: string;
  readonly pageId: string;
  readonly limit?: number;
  readonly offset?: number;
  readonly filters?: Readonly<Record<string, unknown>>;
}

export interface SearchResponse<T extends SearchResult = SearchResult> {
  readonly results: readonly T[];
  readonly total: number;
  readonly query: string;
  readonly executionTimeMs: number;
}

export interface SearchHandler<T extends SearchResult = SearchResult> {
  readonly pageId: string;
  readonly name?: string;
  search(params: SearchParams): Observable<SearchResponse<T>>;
  canHandle?(pageId: string): boolean;
}

export const SEARCH_HANDLER = new InjectionToken<SearchHandler[]>('SearchHandlers');

export interface SearchOptions {
  readonly debounceMs?: number;
  readonly minQueryLength?: number;
  readonly cancelPrevious?: boolean;
}

export const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  debounceMs: 300,
  minQueryLength: 2,
  cancelPrevious: true,
};

export function createSearchParams(
  partial: Partial<SearchParams> & Pick<SearchParams, 'query' | 'pageId'>,
): SearchParams {
  return {
    query: partial.query,
    pageId: partial.pageId,
    limit: partial.limit ?? 10,
    offset: partial.offset ?? 0,
    filters: partial.filters,
  };
}

export function createEmptySearchResponse(query: string): SearchResponse {
  return {
    results: [],
    total: 0,
    query,
    executionTimeMs: 0,
  };
}
