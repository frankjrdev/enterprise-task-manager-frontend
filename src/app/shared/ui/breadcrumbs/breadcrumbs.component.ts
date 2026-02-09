import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  InputSignal,
  OutputEmitterRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { Breadcrumb } from '@core/navigation';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
      <ol class="breadcrumbs__list">
        @for (breadcrumb of breadcrumbs(); track breadcrumb.url; let isLast = $last) {
          <li class="breadcrumbs__item" [class.breadcrumbs__item--active]="breadcrumb.isActive">
            @if (!breadcrumb.isActive) {
              <a
                [routerLink]="breadcrumb.url"
                class="breadcrumbs__link"
                (click)="onBreadcrumbClick(breadcrumb)"
              >
                @if (breadcrumb.icon && showIcons()) {
                  <mat-icon class="breadcrumbs__icon">{{ breadcrumb.icon }}</mat-icon>
                }
                <span class="breadcrumbs__label">{{ breadcrumb.label }}</span>
              </a>
            } @else {
              <span class="breadcrumbs__current" aria-current="page">
                @if (breadcrumb.icon && showIcons()) {
                  <mat-icon class="breadcrumbs__icon">{{ breadcrumb.icon }}</mat-icon>
                }
                <span class="breadcrumbs__label">{{ breadcrumb.label }}</span>
              </span>
            }
            @if (!isLast) {
              <span class="breadcrumbs__separator" aria-hidden="true">
                {{ separator() }}
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [
    `
      .breadcrumbs {
        font-family: inherit;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      .breadcrumbs__list {
        list-style: none;
        margin: 0;
        padding: 0;

        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.25rem;
      }

      .breadcrumbs__item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .breadcrumbs__link {
        text-decoration: none;

        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;

        color: var(--breadcrumb-link-color, #9ca3af);

        transition:
          color 0.2s ease,
          background-color 0.2s ease;

        &:hover {
          color: var(--breadcrumb-link-hover-color, #f3f4f6);
          background-color: var(--breadcrumb-link-hover-bg, rgba(255, 255, 255, 0.1));
        }

        &:focus-visible {
          outline: 2px solid var(--breadcrumb-focus-color, #3b82f6);
          outline-offset: 2px;
        }
      }

      .breadcrumbs__current {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;

        color: var(--breadcrumb-current-color, #f9fafb);
        font-weight: 500;
      }

      .breadcrumbs__icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }

      .breadcrumbs__label {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .breadcrumbs__separator {
        color: var(--breadcrumb-separator-color, #6b7280);
        user-select: none;
        padding: 0 0.25rem;
      }

      @media (max-width: 640px) {
        .breadcrumbs__item:not(.breadcrumbs__item--active) .breadcrumbs__label {
          max-width: 80px;
        }
      }
    `,
  ],
})
export class BreadcrumbsComponent {
  public readonly breadcrumbs: InputSignal<readonly Breadcrumb[]> =
    input.required<readonly Breadcrumb[]>();

  public readonly separator: InputSignal<string> = input<string>('/');

  public readonly showIcons: InputSignal<boolean> = input<boolean>(true);

  public readonly showHomeIcon: InputSignal<boolean> = input<boolean>(true);

  public readonly breadcrumbClick: OutputEmitterRef<Breadcrumb> = output<Breadcrumb>();

  public readonly hasBreadcrumbs = computed(() => this.breadcrumbs().length > 0);

  protected onBreadcrumbClick(breadcrumb: Breadcrumb): void {
    this.breadcrumbClick.emit(breadcrumb);
  }
}
