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
      <span class="search-input__icon-left">
        @if (isSearching()) {
          <mat-icon class="search-input__spinner">sync</mat-icon>
        } @else {
          <mat-icon>search</mat-icon>
        }
      </span>

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
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        width: 100%;
        max-width: 500px;
        height: 30px;

        padding: 0 0.75rem;
        background-color: var(--search-bg, #1f2937);
        border: 1px solid var(--search-border, #313337);
        border-radius: 0;
        box-shadow: none;

        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          background-color 0.2s ease;
      }

      .search-input--focused {
        border-color: var(--search-focus-border, #c6801c);
        box-shadow: none;
        border-radius: 0;
      }

      .search-input--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: var(--search-disabled-bg, #111827);
      }

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

      .search-input__field {
        border: none;
        outline: 0;
        background: transparent;
        box-shadow: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        &:focus,
        &:focus-visible {
          outline: 0;
          box-shadow: none;
          border: none;
        }

        flex: 1;
        min-width: 0;

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

      .search-input__clear {
        border: none;
        background: transparent;
        padding: 0.25rem;
        margin: 0;
        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

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
  public readonly placeholder: InputSignal<string> = input<string>('Search...');

  public readonly isSearching: InputSignal<boolean> = input<boolean>(false);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly initialValue: InputSignal<string> = input<string>('');

  public readonly ariaLabel: InputSignal<string> = input<string>('Search field');

  public readonly searchQuery: OutputEmitterRef<string> = output<string>();

  public readonly clear: OutputEmitterRef<void> = output<void>();

  public readonly focused: OutputEmitterRef<void> = output<void>();

  public readonly blurred: OutputEmitterRef<void> = output<void>();

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  protected query = '';

  private readonly _isFocused = signal(false);

  protected readonly isFocused = this._isFocused.asReadonly();

  protected readonly hasValue = computed(() => this.query.length > 0);

  constructor() {
    effect(() => {
      const initial = this.initialValue();
      if (initial) {
        this.query = initial;
      }
    });
  }

  protected onInput(): void {
    this.searchQuery.emit(this.query);
  }

  protected onFocus(): void {
    this._isFocused.set(true);
    this.focused.emit();
  }

  protected onBlur(): void {
    this._isFocused.set(false);
    this.blurred.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.clearInput();
    }
  }

  protected onClearClick(): void {
    this.clearInput();
  }

  public focus(): void {
    this.inputRef()?.nativeElement.focus();
  }

  public clearInput(): void {
    this.query = '';
    this.searchQuery.emit('');
    this.clear.emit();
    this.focus();
  }
}
