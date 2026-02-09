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

import { Breadcrumb, isBreadcrumbRouteConfig } from '../models/breadcrumb.model';

/**
 * Manages breadcrumb state derived from the router.
 */
@Injectable({
  providedIn: 'root',
})
export class BreadcrumbStore {
  private readonly router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);

  private readonly _breadcrumbs: WritableSignal<readonly Breadcrumb[]> = signal([]);

  private readonly _isLoading: WritableSignal<boolean> = signal(true);

  public readonly breadcrumbs: Signal<readonly Breadcrumb[]> = this._breadcrumbs.asReadonly();

  public readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  public readonly activeBreadcrumb: Signal<Breadcrumb | null> = computed(() => {
    const crumbs = this._breadcrumbs();
    return crumbs.length > 0 ? crumbs[crumbs.length - 1] : null;
  });

  public readonly hasBreadcrumbs: Signal<boolean> = computed(() => this._breadcrumbs().length > 0);

  public readonly depth: Signal<number> = computed(() => this._breadcrumbs().length);

  public readonly navigableBreadcrumbs: Signal<readonly Breadcrumb[]> = computed(() => {
    const crumbs = this._breadcrumbs();
    return crumbs.slice(0, -1);
  });

  constructor() {
    this.initializeRouterSubscription();
  }

  private initializeRouterSubscription(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),

        map(() => this.router.routerState.snapshot.root),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((rootSnapshot) => {
        this._isLoading.set(true);

        const breadcrumbs = this.buildBreadcrumbsFromRoute(rootSnapshot);

        this._breadcrumbs.set(breadcrumbs);
        this._isLoading.set(false);
      });

    const initialBreadcrumbs = this.buildBreadcrumbsFromRoute(
      this.router.routerState.snapshot.root,
    );
    this._breadcrumbs.set(initialBreadcrumbs);
    this._isLoading.set(false);
  }

  private buildBreadcrumbsFromRoute(
    route: ActivatedRouteSnapshot,
    url = '',
    breadcrumbs: Breadcrumb[] = [],
  ): Breadcrumb[] {
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({
        label: 'Home',
        url: '/',
        icon: 'home',
        isActive: false,
      });
    }

    const routeUrl = route.url.map((segment) => segment.path).join('/');
    if (routeUrl) {
      url += `/${routeUrl}`;
    }

    const breadcrumbConfig = route.data['breadcrumb'];

    if (isBreadcrumbRouteConfig(breadcrumbConfig) && !breadcrumbConfig.skip) {
      const label = this.resolveLabel(breadcrumbConfig.label, route.params);

      breadcrumbs.push({
        label,
        url,
        icon: breadcrumbConfig.icon,
        isActive: false,
      });
    } else if (typeof breadcrumbConfig === 'string') {
      breadcrumbs.push({
        label: breadcrumbConfig,
        url,
        isActive: false,
      });
    }

    if (route.firstChild) {
      return this.buildBreadcrumbsFromRoute(route.firstChild, url, breadcrumbs);
    }

    if (breadcrumbs.length > 0) {
      const lastIndex = breadcrumbs.length - 1;
      breadcrumbs[lastIndex] = {
        ...breadcrumbs[lastIndex],
        isActive: true,
      };
    }

    return breadcrumbs;
  }

  private resolveLabel(
    label: string | ((params: Record<string, string>) => string),
    params: Record<string, string>,
  ): string {
    if (typeof label === 'function') {
      return label(params);
    }
    return label;
  }

  public refresh(): void {
    const breadcrumbs = this.buildBreadcrumbsFromRoute(this.router.routerState.snapshot.root);
    this._breadcrumbs.set(breadcrumbs);
  }

  public reset(): void {
    this._breadcrumbs.set([]);
    this._isLoading.set(false);
  }
}
