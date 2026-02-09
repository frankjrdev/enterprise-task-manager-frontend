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
  SearchState,
  createPageContext,
  DEFAULT_PAGE_CONTEXT,
  isPageContextRouteConfig,
} from '../models/page-context.model';

/**
 * Manages current page context and search state derived from the router.
 */
@Injectable({
  providedIn: 'root',
})
export class PageContextStore {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _context: WritableSignal<PageContext> = signal(DEFAULT_PAGE_CONTEXT);

  private readonly _searchState: WritableSignal<SearchState> = signal({
    query: '',
    isSearching: false,
    results: [],
    error: null,
  });

  public readonly context: Signal<PageContext> = this._context.asReadonly();

  public readonly pageTitle: Signal<string> = computed(() => this._context().pageTitle);

  public readonly pageId: Signal<string> = computed(() => this._context().pageId);

  public readonly searchPlaceholder: Signal<string> = computed(
    () => this._context().searchPlaceholder,
  );

  public readonly searchEnabled: Signal<boolean> = computed(() => this._context().searchEnabled);

  public readonly metadata: Signal<Readonly<Record<string, unknown>> | undefined> = computed(
    () => this._context().metadata,
  );

  public readonly searchQuery: Signal<string> = computed(() => this._searchState().query);

  public readonly isSearching: Signal<boolean> = computed(() => this._searchState().isSearching);

  public readonly searchResults: Signal<readonly unknown[]> = computed(
    () => this._searchState().results,
  );

  public readonly searchError: Signal<string | null> = computed(() => this._searchState().error);

  public readonly hasActiveSearch: Signal<boolean> = computed(
    () => this._searchState().query.trim().length > 0,
  );

  constructor() {
    this.initializeRouterSubscription();
  }

  private initializeRouterSubscription(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => ({
          url: event.urlAfterRedirects,
          snapshot: this.router.routerState.snapshot.root,
        })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ url, snapshot }) => {
        const context = this.buildContextFromRoute(snapshot, url);
        this._context.set(context);

        this.clearSearch();
      });

    const initialUrl = this.router.url;
    const initialSnapshot = this.router.routerState.snapshot.root;
    const initialContext = this.buildContextFromRoute(initialSnapshot, initialUrl);
    this._context.set(initialContext);
  }

  private buildContextFromRoute(route: ActivatedRouteSnapshot, url: string): PageContext {
    let currentRoute = route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    const routeConfig = currentRoute.data['pageContext'];

    if (isPageContextRouteConfig(routeConfig)) {
      return createPageContext({
        pageTitle: routeConfig.title,
        pageId: url,
        searchPlaceholder: routeConfig.searchPlaceholder ?? 'Search...',
        searchEnabled: !routeConfig.searchDisabled,
        metadata: routeConfig.metadata,
      });
    }

    const breadcrumbLabel = currentRoute.data['breadcrumb'];
    if (typeof breadcrumbLabel === 'string') {
      return createPageContext({
        pageTitle: breadcrumbLabel,
        pageId: url,
      });
    }

    return createPageContext({
      pageTitle: 'Dashboard',
      pageId: url,
    });
  }

  public setSearchQuery(query: string): void {
    this._searchState.update((state) => ({
      ...state,
      query,
    }));
  }

  public setSearching(isSearching: boolean): void {
    this._searchState.update((state) => ({
      ...state,
      isSearching,
    }));
  }

  public setSearchResults(results: readonly unknown[]): void {
    this._searchState.update((state) => ({
      ...state,
      results,
      isSearching: false,
      error: null,
    }));
  }

  public setSearchError(error: string): void {
    this._searchState.update((state) => ({
      ...state,
      error,
      isSearching: false,
      results: [],
    }));
  }

  public clearSearch(): void {
    this._searchState.set({
      query: '',
      isSearching: false,
      results: [],
      error: null,
    });
  }

  public setContext(context: PageContext): void {
    this._context.set(context);
  }

  public reset(): void {
    this._context.set(DEFAULT_PAGE_CONTEXT);
    this.clearSearch();
  }
}
