// ============================================================================
// Search Input Component - Dumb/Presentational Component
// ============================================================================
// PROPOSITO: Renderiza campo de busqueda con UX optimizada.
//
// CARACTERISTICAS:
// - Debounce integrado (configurable)
// - Loading state visual
// - Clear button
// - Keyboard shortcuts (Escape para limpiar)
// - Accesibilidad completa
//
// ARQUITECTURA - Dumb Component:
// - Recibe placeholder via input
// - Emite queries via output
// - NO conoce logica de busqueda (SRP)
// ============================================================================

import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  ElementRef,
  viewChild,
  InputSignal,
  OutputEmitterRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

/**
 * Search Input Component - Campo de busqueda reutilizable.
 *
 * USAGE:
 * ```html
 * <app-search-input
 *   [placeholder]="pageContext.searchPlaceholder()"
 *   [isSearching]="pageContext.isSearching()"
 *   [disabled]="!pageContext.searchEnabled()"
 *   (search)="onSearch($event)"
 *   (clear)="onClear()"
 * />
 * ```
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="search-input"
      [class.search-input--focused]="isFocused()"
      [class.search-input--disabled]="disabled()"
      [class.search-input--loading]="isSearching()"
    >
      <!--
        ICONO DE BUSQUEDA:
        - A la izquierda (patron comun)
        - Cambia a spinner cuando isSearching
      -->
      <span class="search-input__icon-left">
        @if (isSearching()) {
          <!--
            SPINNER:
            - CSS animation para rotacion
            - mat-icon con class de animacion
          -->
          <mat-icon class="search-input__spinner">sync</mat-icon>
        } @else {
          <mat-icon>search</mat-icon>
        }
      </span>

      <!--
        INPUT DE TEXTO:
        - ngModel para two-way binding local
        - Eventos para focus/blur/keydown
        - #inputRef para acceso programatico
      -->
      <input
        #inputRef
        type="text"
        class="search-input__field"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [(ngModel)]="query"
        (input)="onInput()"
        (focus)="onFocus()"
        (blur)="onBlur()"
        (keydown)="onKeydown($event)"
        [attr.aria-label]="ariaLabel()"
        autocomplete="off"
        spellcheck="false"
      />

      <!--
        BOTON CLEAR:
        - Solo visible cuando hay texto
        - Limpia el input y emite evento
      -->
      @if (hasValue()) {
        <button
          type="button"
          class="search-input__clear"
          (click)="onClearClick()"
          aria-label="Clear search"
        >
          <mat-icon>close</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .search-input {
        /* Layout */
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        /* Sizing */
        width: 100%;
        max-width: 500px;
        height: 30px;

        /* Styling */
        padding: 0 0.75rem;
        background-color: var(--search-bg, #1f2937);
        border: 1px solid var(--search-border, #313337);
        border-radius: 0;
        box-shadow: none;

        /* Transition para estados */
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          background-color 0.2s ease;
      }

      /* Estado: Focused */
      .search-input--focused {
        border-color: var(--search-focus-border, #c6801c);
        box-shadow: none;
        border-radius: 0;
      }

      /* Estado: Disabled */
      .search-input--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: var(--search-disabled-bg, #111827);
      }

      /* Estado: Loading */
      .search-input--loading {
        /* Visual indicator de loading */
      }

      /* Iconos */
      .search-input__icon-left {
        display: flex;
        align-items: center;
        color: var(--search-icon-color, #6b7280);
        flex-shrink: 0;

        mat-icon {
          font-size: 1.25rem;
          width: 1.25rem;
          height: 1.25rem;
        }
      }

      /* Spinner animation */
      .search-input__spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* Campo de texto */
      .search-input__field {
        /* Reset navegador */
        border: none;
        outline: 0;
        background: transparent;
        box-shadow: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        /* Focus reset */
        &:focus,
        &:focus-visible {
          outline: 0;
          box-shadow: none;
          border: none;
        }

        /* Fill disponible */
        flex: 1;
        min-width: 0; /* Permite shrink */

        /* Texto */
        font-family: inherit;
        font-size: 0.875rem;
        color: var(--search-text-color, #f9fafb);

        &::placeholder {
          color: var(--search-placeholder-color, #6b7280);
        }

        &:disabled {
          cursor: not-allowed;
        }
      }

      /* Boton Clear */
      .search-input__clear {
        /* Reset button */
        border: none;
        background: transparent;
        padding: 0.25rem;
        margin: 0;
        cursor: pointer;

        /* Layout */
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        /* Styling */
        color: var(--search-clear-color, #6b7280);
        border-radius: 4px;
        transition:
          color 0.2s ease,
          background-color 0.2s ease;

        &:hover {
          color: var(--search-clear-hover-color, #f9fafb);
          background-color: var(--search-clear-hover-bg, rgba(255, 255, 255, 0.1));
        }

        &:focus-visible {
          outline: 2px solid var(--search-focus-border, #3b82f6);
          outline-offset: 1px;
        }

        mat-icon {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }
      }
    `,
  ],
})
export class SearchInputComponent {
  // ============================================================================
  // Inputs
  // ============================================================================

  /**
   * Placeholder del campo de busqueda.
   */
  public readonly placeholder: InputSignal<string> = input<string>('Search...');

  /**
   * Indica si hay busqueda en progreso (muestra spinner).
   */
  public readonly isSearching: InputSignal<boolean> = input<boolean>(false);

  /**
   * Deshabilita el input.
   */
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  /**
   * Valor inicial del input.
   */
  public readonly initialValue: InputSignal<string> = input<string>('');

  /**
   * Label de accesibilidad.
   */
  public readonly ariaLabel: InputSignal<string> = input<string>('Search field');

  // ============================================================================
  // Outputs
  // ============================================================================

  /**
   * Emitido cuando el usuario escribe (con cada cambio).
   * El parent decide si aplicar debounce.
   */
  public readonly searchQuery: OutputEmitterRef<string> = output<string>();

  /**
   * Emitido cuando el usuario limpia la busqueda.
   */
  public readonly clear: OutputEmitterRef<void> = output<void>();

  /**
   * Emitido cuando el input recibe focus.
   */
  public readonly focused: OutputEmitterRef<void> = output<void>();

  /**
   * Emitido cuando el input pierde focus.
   */
  public readonly blurred: OutputEmitterRef<void> = output<void>();

  // ============================================================================
  // View Queries
  // ============================================================================

  /**
   * Referencia al input nativo.
   *
   * viewChild() es la nueva API de Angular 17+:
   * - Reemplaza @ViewChild
   * - Retorna signal
   * - Type-safe
   */
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  // ============================================================================
  // Internal State
  // ============================================================================

  /**
   * Valor actual del input.
   * Manejado localmente para responsividad inmediata.
   */
  protected query = '';

  /**
   * Estado de focus del input.
   */
  private readonly _isFocused = signal(false);

  // ============================================================================
  // Computed Signals
  // ============================================================================

  /**
   * Estado de focus (readonly para template).
   */
  protected readonly isFocused = this._isFocused.asReadonly();

  /**
   * Indica si hay valor en el input.
   */
  protected readonly hasValue = computed(() => this.query.length > 0);

  // ============================================================================
  // Lifecycle
  // ============================================================================

  constructor() {
    // Effect para sincronizar valor inicial
    effect(() => {
      const initial = this.initialValue();
      if (initial) {
        this.query = initial;
      }
    });
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Maneja input del usuario.
   */
  protected onInput(): void {
    this.searchQuery.emit(this.query);
  }

  /**
   * Maneja focus.
   */
  protected onFocus(): void {
    this._isFocused.set(true);
    this.focused.emit();
  }

  /**
   * Maneja blur.
   */
  protected onBlur(): void {
    this._isFocused.set(false);
    this.blurred.emit();
  }

  /**
   * Maneja keydown para shortcuts.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.clearInput();
    }
  }

  /**
   * Maneja click en boton clear.
   */
  protected onClearClick(): void {
    this.clearInput();
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Focaliza el input programaticamente.
   * Util para keyboard shortcuts (ej: Ctrl+K).
   */
  public focus(): void {
    this.inputRef()?.nativeElement.focus();
  }

  /**
   * Limpia el input.
   */
  public clearInput(): void {
    this.query = '';
    this.searchQuery.emit('');
    this.clear.emit();
    this.focus();
  }
}
