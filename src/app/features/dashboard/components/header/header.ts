import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  HostListener,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { BreadcrumbStore, PageContextStore, Breadcrumb } from '@core/navigation';

import { SearchDispatcher } from '@core/search';

import { BreadcrumbsComponent } from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import { SearchInputComponent } from '../../../../shared/ui/search-input/search-input.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, BreadcrumbsComponent, SearchInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  private readonly breadcrumbStore = inject(BreadcrumbStore);

  private readonly pageContextStore = inject(PageContextStore);

  private readonly searchDispatcher = inject(SearchDispatcher);

  private readonly searchInput = viewChild(SearchInputComponent);

  protected readonly breadcrumbs = this.breadcrumbStore.breadcrumbs;

  protected readonly hasBreadcrumbs = this.breadcrumbStore.hasBreadcrumbs;

  protected readonly searchPlaceholder = this.pageContextStore.searchPlaceholder;

  protected readonly searchEnabled = this.pageContextStore.searchEnabled;

  protected readonly isSearching = this.pageContextStore.isSearching;

  protected readonly pageTitle = this.pageContextStore.pageTitle;

  protected readonly showSearch = computed(() => this.searchEnabled());

  protected readonly notificationCount = computed(() => {
    return 3;
  });

  protected readonly hasNotifications = computed(() => this.notificationCount() > 0);

  protected onSearch(query: string): void {
    this.searchDispatcher.dispatch(query);
  }

  protected onSearchClear(): void {
    this.searchDispatcher.clear();
  }

  protected onBreadcrumbClick(breadcrumb: Breadcrumb): void {
    console.debug('[Header] Breadcrumb clicked:', breadcrumb.label);
  }

  protected onNotificationsClick(): void {
    console.debug('[Header] Notifications clicked');
  }

  protected onNewTaskClick(): void {
    console.debug('[Header] New Task clicked');
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
    }
  }

  private focusSearch(): void {
    this.searchInput()?.focus();
  }
}
