import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  of,
  catchError,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  tap,
} from 'rxjs';

import { PageContextStore } from '../../navigation/stores/page-context.store';
import {
  SearchHandler,
  SearchResponse,
  SearchOptions,
  SEARCH_HANDLER,
  DEFAULT_SEARCH_OPTIONS,
  createSearchParams,
  createEmptySearchResponse,
} from '../models/search.model';

@Injectable({
  providedIn: 'root',
})
export class SearchDispatcher {
  private readonly destroyRef = inject(DestroyRef);
  private readonly pageContextStore = inject(PageContextStore);
  private readonly injectedHandlers =
    inject<SearchHandler[] | null>(SEARCH_HANDLER, { optional: true }) ?? [];
  private readonly handlersMap = new Map<string, SearchHandler>();
  private readonly searchSubject = new Subject<string>();
  private options: Required<SearchOptions> = DEFAULT_SEARCH_OPTIONS;

  constructor() {
    if (this.injectedHandlers.length > 0) {
      this.injectedHandlers.forEach((handler) => this.registerHandler(handler));
    }
    this.initializeSearchPipeline();
  }

  public registerHandler(handler: SearchHandler): void {
    if (this.handlersMap.has(handler.pageId)) {
      console.warn(
        `[SearchDispatcher] Handler for pageId "${handler.pageId}" already registered. Overwriting.`,
      );
    }
    this.handlersMap.set(handler.pageId, handler);
  }

  public unregisterHandler(pageId: string): void {
    this.handlersMap.delete(pageId);
  }

  public getHandler(pageId: string): SearchHandler | undefined {
    return this.handlersMap.get(pageId);
  }

  public hasHandler(pageId: string): boolean {
    return this.handlersMap.has(pageId);
  }

  public dispatch(query: string): void {
    this.pageContextStore.setSearchQuery(query);
    this.searchSubject.next(query);
  }

  public clear(): void {
    this.pageContextStore.clearSearch();
    this.searchSubject.next('');
  }

  public configure(options: Partial<SearchOptions>): void {
    this.options = { ...this.options, ...options };
  }

  private initializeSearchPipeline(): void {
    this.searchSubject
      .pipe(
        debounceTime(this.options.debounceMs),
        distinctUntilChanged(),
        tap((query) => {
          if (query.length > 0 && query.length < this.options.minQueryLength) {
            this.pageContextStore.setSearchResults([]);
          }
        }),
        filter((query) => {
          if (query.length === 0) {
            this.pageContextStore.clearSearch();
            return false;
          }
          return query.length >= this.options.minQueryLength;
        }),
        switchMap((query) => this.executeSearch(query)),
        takeUntilDestroyed(this.destroyRef),
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

  private executeSearch(query: string): Observable<SearchResponse> {
    const pageId = this.pageContextStore.pageId();

    const handler = this.findHandler(pageId);

    if (!handler) {
      console.warn(`[SearchDispatcher] No handler found for pageId "${pageId}"`);
      return of(createEmptySearchResponse(query));
    }

    this.pageContextStore.setSearching(true);

    const params = createSearchParams({ query, pageId });

    return handler.search(params).pipe(
      catchError((error) => {
        console.error(`[SearchDispatcher] Search error for "${pageId}":`, error);
        this.pageContextStore.setSearchError(error.message || 'Search failed');
        return of(createEmptySearchResponse(query));
      }),
    );
  }

  private findHandler(pageId: string): SearchHandler | null {
    const exactMatch = this.handlersMap.get(pageId);
    if (exactMatch) {
      return exactMatch;
    }

    for (const handler of this.handlersMap.values()) {
      if (handler.canHandle?.(pageId)) {
        return handler;
      }
    }

    return null;
  }
}
