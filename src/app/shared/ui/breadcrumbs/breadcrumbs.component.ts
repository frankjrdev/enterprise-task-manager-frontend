// ============================================================================
// Breadcrumbs Component - Dumb/Presentational Component
// ============================================================================
// PROPOSITO: Renderiza breadcrumbs de forma visual.
//
// ARQUITECTURA - Dumb Component:
// - NO inyecta servicios (excepto para navegacion)
// - RECIBE datos via inputs
// - EMITE eventos via outputs
// - FACIL de testear (solo inputs/outputs)
//
// POR QUE dumb component:
// - Reusable: Puede usarse con cualquier fuente de datos
// - Testable: No necesita mocks de servicios
// - Predictable: Mismo input = mismo output
// - Single Responsibility: Solo renderizado
//
// COMO funciona el change detection con signals:
// - OnPush: Solo verifica cuando inputs cambian o eventos ocurren
// - Signal inputs: Angular detecta cambios automaticamente
// - computed(): Se recalcula solo cuando dependencias cambian
// ============================================================================

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

/**
 * Breadcrumbs Component - Renderiza navegacion de breadcrumbs.
 *
 * USAGE:
 * ```html
 * <app-breadcrumbs
 *   [breadcrumbs]="breadcrumbStore.breadcrumbs()"
 *   [showHomeIcon]="true"
 *   (breadcrumbClick)="onBreadcrumbClick($event)"
 * />
 * ```
 *
 * ACCESIBILIDAD (a11y):
 * - nav con aria-label
 * - ol para lista ordenada semantica
 * - aria-current="page" en el activo
 * - Focus visible en links
 */
@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      SEMANTICA HTML:
      - <nav>: Elemento de navegacion (screen readers lo anuncian)
      - aria-label: Describe el proposito
      - <ol>: Lista ordenada (breadcrumbs tienen orden)
      - <li>: Cada item de la lista
    -->
    <nav
      class="breadcrumbs"
      aria-label="Breadcrumb navigation"
    >
      <ol class="breadcrumbs__list">
        <!--
          ANGULAR 17+ CONTROL FLOW:
          - @for: Reemplaza *ngFor
          - track: Obligatorio, optimiza re-renders
          - $index, $first, $last: Variables contextuales

          POR QUE track by url:
          - URL es unica por breadcrumb
          - Permite a Angular reusar DOM nodes
          - Mejor performance en cambios
        -->
        @for (breadcrumb of breadcrumbs(); track breadcrumb.url; let isLast = $last) {
          <li
            class="breadcrumbs__item"
            [class.breadcrumbs__item--active]="breadcrumb.isActive"
          >
            <!--
              LOGICA DE RENDERIZADO:
              - Si NO es activo: Renderizar como link (navegable)
              - Si ES activo: Renderizar como span (no clickeable)

              POR QUE:
              - UX: No tiene sentido navegar a donde ya estas
              - a11y: aria-current="page" indica ubicacion actual
            -->
            @if (!breadcrumb.isActive) {
              <a
                [routerLink]="breadcrumb.url"
                class="breadcrumbs__link"
                (click)="onBreadcrumbClick(breadcrumb)"
              >
                <!--
                  ICONO CONDICIONAL:
                  - Muestra icono si existe Y showIcons es true
                  - Home siempre muestra icono si showHomeIcon
                -->
                @if (breadcrumb.icon && showIcons()) {
                  <mat-icon class="breadcrumbs__icon">{{ breadcrumb.icon }}</mat-icon>
                }
                <span class="breadcrumbs__label">{{ breadcrumb.label }}</span>
              </a>
            } @else {
              <span
                class="breadcrumbs__current"
                aria-current="page"
              >
                @if (breadcrumb.icon && showIcons()) {
                  <mat-icon class="breadcrumbs__icon">{{ breadcrumb.icon }}</mat-icon>
                }
                <span class="breadcrumbs__label">{{ breadcrumb.label }}</span>
              </span>
            }

            <!--
              SEPARADOR:
              - Solo entre items (no despues del ultimo)
              - aria-hidden: Decorativo, no para screen readers
            -->
            @if (!isLast) {
              <span
                class="breadcrumbs__separator"
                aria-hidden="true"
              >
                {{ separator() }}
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    /*
     * ESTRUCTURA CSS:
     * - BEM naming: Block__Element--Modifier
     * - Flexbox para layout
     * - CSS variables para theming
     */

    .breadcrumbs {
      /* Reset y base */
      font-family: inherit;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .breadcrumbs__list {
      /* Reset de lista */
      list-style: none;
      margin: 0;
      padding: 0;

      /* Layout horizontal */
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
      /* Reset de link */
      text-decoration: none;

      /* Layout */
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;

      /* Colores - usando CSS vars para theming */
      color: var(--breadcrumb-link-color, #9ca3af);

      /* Transicion suave */
      transition: color 0.2s ease, background-color 0.2s ease;

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
      /* Similar a link pero sin interactividad */
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;

      /* Color destacado para item actual */
      color: var(--breadcrumb-current-color, #f9fafb);
      font-weight: 500;
    }

    .breadcrumbs__icon {
      /* Material icon sizing */
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .breadcrumbs__label {
      /* Truncar labels largos */
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .breadcrumbs__separator {
      /* Separador visual */
      color: var(--breadcrumb-separator-color, #6b7280);
      user-select: none;
      padding: 0 0.25rem;
    }

    /* Responsive: Ocultar labels en mobile, solo iconos */
    @media (max-width: 640px) {
      .breadcrumbs__item:not(.breadcrumbs__item--active) .breadcrumbs__label {
        /* Clase para sr-only si se desea ocultar visualmente */
        /* Por ahora, truncamos mas agresivamente */
        max-width: 80px;
      }
    }
  `],
})
export class BreadcrumbsComponent {
  // ============================================================================
  // Inputs - Signal-based Inputs (Angular 17+)
  // ============================================================================

  /**
   * Array de breadcrumbs a renderizar.
   *
   * SIGNAL INPUT:
   * - input<T>() crea un InputSignal
   * - Se lee como funcion: breadcrumbs()
   * - Angular detecta cambios automaticamente
   *
   * POR QUE required:
   * - El componente no tiene sentido sin breadcrumbs
   * - TypeScript garantiza que se pase
   */
  public readonly breadcrumbs: InputSignal<readonly Breadcrumb[]> =
    input.required<readonly Breadcrumb[]>();

  /**
   * Caracter separador entre breadcrumbs.
   * Default: '/'
   */
  public readonly separator: InputSignal<string> = input<string>('/');

  /**
   * Mostrar iconos en breadcrumbs.
   * Default: true
   */
  public readonly showIcons: InputSignal<boolean> = input<boolean>(true);

  /**
   * Siempre mostrar icono de Home.
   * Default: true
   */
  public readonly showHomeIcon: InputSignal<boolean> = input<boolean>(true);

  // ============================================================================
  // Outputs - Event Emitters
  // ============================================================================

  /**
   * Emitido cuando se hace click en un breadcrumb.
   *
   * OUTPUT (Angular 17+):
   * - output<T>() crea un OutputEmitterRef
   * - Reemplaza @Output() + EventEmitter
   * - Mas type-safe y moderno
   *
   * POR QUE emitir evento:
   * - Permite al parent ejecutar logica adicional
   * - Tracking, analytics, side effects
   * - El componente no conoce estos detalles (SRP)
   */
  public readonly breadcrumbClick: OutputEmitterRef<Breadcrumb> =
    output<Breadcrumb>();

  // ============================================================================
  // Computed Signals - Derived State
  // ============================================================================

  /**
   * Indica si hay breadcrumbs para mostrar.
   * Util para condicionales en parent.
   */
  public readonly hasBreadcrumbs = computed(
    () => this.breadcrumbs().length > 0
  );

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Maneja click en breadcrumb.
   * La navegacion la hace routerLink, esto es para side effects.
   */
  protected onBreadcrumbClick(breadcrumb: Breadcrumb): void {
    this.breadcrumbClick.emit(breadcrumb);
  }
}
