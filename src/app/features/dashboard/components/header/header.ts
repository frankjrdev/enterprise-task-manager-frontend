// ============================================================================
// Header Component - Smart/Container Component
// ============================================================================
// PROPOSITO: Componente contenedor que coordina breadcrumbs, busqueda y acciones.
//
// ARQUITECTURA - Smart Component:
// - INYECTA stores para obtener estado
// - COORDINA entre componentes dumb
// - DELEGA logica a servicios
// - MANEJA side effects (navegacion, etc)
//
// DIFERENCIA Smart vs Dumb:
// - Smart (este): Conoce el estado global, inyecta servicios
// - Dumb (BreadcrumbsComponent): Solo renderiza, inputs/outputs
//
// POR QUE esta separacion:
// - Testing: Dumb components son faciles de testear
// - Reusabilidad: Dumb components son reutilizables
// - Mantenibilidad: Logica centralizada en smart components
//
// SIGNALS vs OBSERVABLES en este componente:
// - Usamos signals porque:
//   1. No necesitamos operadores RxJS complejos
//   2. Change detection mas eficiente
//   3. Codigo mas limpio y declarativo
//   4. Es el patron moderno de Angular 17+
// ============================================================================

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  HostListener,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

// Core - Navigation (stores para estado global)
import { BreadcrumbStore, PageContextStore, Breadcrumb } from '@core/navigation';

// Core - Search (dispatcher para busquedas)
import { SearchDispatcher } from '@core/search';

// Shared UI - Dumb components
import { BreadcrumbsComponent } from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import { SearchInputComponent } from '../../../../shared/ui/search-input/search-input.component';

/**
 * Header Component - Smart container para la barra superior.
 *
 * RESPONSABILIDADES:
 * 1. Obtener breadcrumbs del BreadcrumbStore
 * 2. Obtener contexto de pagina del PageContextStore
 * 3. Despachar busquedas al SearchDispatcher
 * 4. Coordinar UI de acciones (notifications, new task)
 *
 * QUE NO HACE (por SRP):
 * - Construir breadcrumbs (lo hace BreadcrumbStore)
 * - Ejecutar busquedas (lo hace SearchDispatcher)
 * - Renderizar breadcrumbs (lo hace BreadcrumbsComponent)
 *
 * PERFORMANCE:
 * - OnPush: Solo re-renderiza cuando signals cambian
 * - Signals granulares: Solo actualiza lo necesario
 * - Computed: Memoiza derivaciones
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    BreadcrumbsComponent,
    SearchInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  // ============================================================================
  // Dependency Injection - Stores y Services
  // ============================================================================

  /**
   * Store de breadcrumbs.
   *
   * POR QUE inject() en lugar de constructor:
   * - Mas declarativo y moderno
   * - Permite usar en computed/effect fuera de constructor
   * - Es el pattern preferido en Angular 14+
   */
  private readonly breadcrumbStore = inject(BreadcrumbStore);

  /**
   * Store de contexto de pagina.
   */
  private readonly pageContextStore = inject(PageContextStore);

  /**
   * Dispatcher de busqueda.
   */
  private readonly searchDispatcher = inject(SearchDispatcher);

  // ============================================================================
  // View Queries
  // ============================================================================

  /**
   * Referencia al componente de busqueda.
   * Usado para keyboard shortcuts (Ctrl+K).
   */
  private readonly searchInput = viewChild(SearchInputComponent);

  // ============================================================================
  // Public Signals - Expuestos al Template
  // ============================================================================

  /**
   * Breadcrumbs desde el store.
   *
   * COMO funciona la reactividad:
   * 1. Usuario navega -> Router emite NavigationEnd
   * 2. BreadcrumbStore escucha y actualiza _breadcrumbs signal
   * 3. Este computed detecta el cambio
   * 4. Angular re-renderiza solo esta parte del template
   *
   * POR QUE computed() aqui:
   * - Aunque es solo un proxy, computed() documenta la intencion
   * - Permite agregar transformaciones en el futuro
   * - Consistencia con otros signals derivados
   */
  protected readonly breadcrumbs = this.breadcrumbStore.breadcrumbs;

  /**
   * Indica si hay breadcrumbs para mostrar.
   */
  protected readonly hasBreadcrumbs = this.breadcrumbStore.hasBreadcrumbs;

  /**
   * Placeholder de busqueda dinamico.
   */
  protected readonly searchPlaceholder = this.pageContextStore.searchPlaceholder;

  /**
   * Indica si la busqueda esta habilitada.
   */
  protected readonly searchEnabled = this.pageContextStore.searchEnabled;

  /**
   * Indica si hay busqueda en progreso.
   */
  protected readonly isSearching = this.pageContextStore.isSearching;

  /**
   * Titulo de la pagina (para titulo de documento).
   */
  protected readonly pageTitle = this.pageContextStore.pageTitle;

  // ============================================================================
  // Computed Signals - Estado Derivado
  // ============================================================================

  /**
   * Indica si mostrar el input de busqueda.
   *
   * LOGICA:
   * - Mostrar si searchEnabled es true
   * - Paginas como Settings pueden deshabilitarlo
   */
  protected readonly showSearch = computed(() => this.searchEnabled());

  /**
   * Badge de notificaciones (ejemplo de estado local).
   *
   * TODO: Conectar con NotificationStore cuando exista.
   */
  protected readonly notificationCount = computed(() => {
    // Placeholder - en produccion vendria de un store
    return 3;
  });

  /**
   * Indica si hay notificaciones no leidas.
   */
  protected readonly hasNotifications = computed(
    () => this.notificationCount() > 0
  );

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Maneja busqueda desde el input.
   *
   * FLUJO:
   * 1. Usuario escribe en SearchInputComponent
   * 2. SearchInputComponent emite (search)
   * 3. Este metodo recibe el query
   * 4. Despacha al SearchDispatcher
   * 5. SearchDispatcher actualiza PageContextStore
   * 6. UI se actualiza reactivamente
   *
   * @param query - Query de busqueda
   */
  protected onSearch(query: string): void {
    this.searchDispatcher.dispatch(query);
  }

  /**
   * Maneja clear de busqueda.
   */
  protected onSearchClear(): void {
    this.searchDispatcher.clear();
  }

  /**
   * Maneja click en breadcrumb.
   *
   * POR QUE existe si routerLink navega automaticamente:
   * - Analytics/tracking de navegacion
   * - Side effects (cerrar menus, etc)
   * - Logging en desarrollo
   *
   * @param breadcrumb - Breadcrumb clickeado
   */
  protected onBreadcrumbClick(breadcrumb: Breadcrumb): void {
    // Analytics o logging
    console.debug('[Header] Breadcrumb clicked:', breadcrumb.label);
  }

  /**
   * Maneja click en notificaciones.
   *
   * TODO: Abrir panel de notificaciones.
   */
  protected onNotificationsClick(): void {
    console.debug('[Header] Notifications clicked');
    // TODO: Implementar panel de notificaciones
  }

  /**
   * Maneja click en "New Task".
   *
   * TODO: Abrir modal de creacion de tarea.
   */
  protected onNewTaskClick(): void {
    console.debug('[Header] New Task clicked');
    // TODO: Implementar modal de nueva tarea
  }

  // ============================================================================
  // Keyboard Shortcuts
  // ============================================================================

  /**
   * Keyboard shortcut para focus en busqueda.
   *
   * SHORTCUT: Ctrl+K o Cmd+K (Mac)
   *
   * POR QUE Ctrl+K:
   * - Convencion en muchas apps (VS Code, Slack, etc)
   * - Facil de recordar
   * - No conflicta con otros shortcuts del browser
   *
   * @HostListener - Escucha eventos en el host (window)
   */
  @HostListener('window:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    // Ctrl+K (Windows/Linux) o Cmd+K (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
    }
  }

  /**
   * Focaliza el input de busqueda.
   */
  private focusSearch(): void {
    this.searchInput()?.focus();
  }
}
