# Implementación de Breadcrumbs y Page Context en Angular

## Descripción General

Esta guía explica cómo implementar un sistema completo de breadcrumbs dinámicos y contexto de página (page context) en Angular, permitiendo que el header sea consciente de la página actual y ajuste dinámicamente el placeholder del input de búsqueda y su funcionalidad.

## Opciones para Implementar Breadcrumbs en Angular

### 1. Implementación Custom con Router (✅ RECOMENDADA)
- ✅ Sin dependencias externas
- ✅ Control total sobre el diseño
- ✅ Se integra perfectamente con Angular Router
- ✅ Usa `ActivatedRoute` y configuración de rutas
- ✅ Lightweight y performante

### 2. Librería xng-breadcrumb
- ✅ Muy popular y mantenida
- ❌ Dependencia externa adicional
- ✅ Fácil configuración
- Instalación: `npm install xng-breadcrumb`

### 3. PrimeNG Breadcrumb
- ✅ Si ya usas PrimeNG
- ❌ Requiere instalar toda la librería
- ✅ Componente UI completo

---

## Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────┐
│                      Router Events                          │
│                  (NavigationEnd)                            │
└────────────────┬───────────────────────┬────────────────────┘
                 │                       │
                 ▼                       ▼
     ┌───────────────────────┐ ┌─────────────────────────┐
     │  BreadcrumbService    │ │  PageContextService     │
     │                       │ │                         │
     │ - Escucha rutas       │ │ - Define configuración  │
     │ - Lee data config     │ │ - Search placeholder    │
     │ - Genera breadcrumbs  │ │ - Search function       │
     └───────────┬───────────┘ └──────────┬──────────────┘
                 │                        │
                 └────────┬───────────────┘
                          ▼
                ┌──────────────────────┐
                │  HeaderComponent     │
                │                      │
                │ - Breadcrumbs UI     │
                │ - Dynamic search     │
                │ - Page context       │
                └──────────────────────┘
```

---

## Implementación Paso a Paso

### Paso 1: Actualizar el Modelo de Breadcrumb

**Archivo:** `src/app/shared/models/breadcrumb.model.ts`

```typescript
export interface Breadcrumb {
  label: string;
  url: string;
  isActive?: boolean;
}

export interface PageContext {
  pageTitle: string;
  searchPlaceholder: string;
  searchFunction?: (query: string) => void;
}
```

**Cambios:**
- Renombrar `path` a `url` para mayor claridad
- Renombrar `active` a `isActive` para consistencia
- Agregar interfaz `PageContext` para el contexto de página

---

### Paso 2: Crear BreadcrumbService

**Archivo:** `src/app/core/services/breadcrumb.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { Breadcrumb } from '@shared/models/breadcrumb.model';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // Escuchar cambios de navegación
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        distinctUntilChanged()
      )
      .subscribe(() => {
        const breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
        this.breadcrumbs$.next(breadcrumbs);
      });
  }

  /**
   * Obtiene el observable de breadcrumbs
   * Los componentes pueden suscribirse para recibir actualizaciones
   */
  getBreadcrumbs(): Observable<Breadcrumb[]> {
    return this.breadcrumbs$.asObservable();
  }

  /**
   * Construye recursivamente el array de breadcrumbs
   * navegando por el árbol de rutas activadas
   */
  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    // Agregar breadcrumb de inicio (Home)
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: 'Home', url: '/', isActive: false });
    }

    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      // Construir la URL del segmento actual
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');
      
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      // Leer el label del breadcrumb desde la configuración de la ruta
      const label = child.snapshot.data['breadcrumb'];
      
      if (label) {
        breadcrumbs.push({
          label,
          url,
          isActive: false,
        });
      }

      // Recursión para procesar hijos
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    // Marcar el último breadcrumb como activo
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    return breadcrumbs;
  }
}
```

**Funcionalidades:**
- ✅ Escucha eventos de navegación automáticamente
- ✅ Construye breadcrumbs recursivamente desde el árbol de rutas
- ✅ Lee configuración desde `data: { breadcrumb: '...' }`
- ✅ Marca el último breadcrumb como activo
- ✅ Expone Observable para suscripción reactiva

---

### Paso 3: Crear PageContextService

**Archivo:** `src/app/core/services/page-context.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PageContext } from '@shared/models/breadcrumb.model';

@Injectable({
  providedIn: 'root',
})
export class PageContextService {
  private pageContext$ = new BehaviorSubject<PageContext>({
    pageTitle: 'Dashboard',
    searchPlaceholder: 'Search...',
  });

  /**
   * Configuración de cada página
   * Define el título, placeholder y función de búsqueda
   */
  private pageConfigs: { [key: string]: PageContext } = {
    '/dashboard': {
      pageTitle: 'Dashboard Overview',
      searchPlaceholder: 'Search dashboard...',
      searchFunction: (query: string) => this.searchDashboard(query),
    },
    '/dashboard/projects': {
      pageTitle: 'Projects',
      searchPlaceholder: 'Search projects by name, status...',
      searchFunction: (query: string) => this.searchProjects(query),
    },
    '/dashboard/tasks': {
      pageTitle: 'Tasks',
      searchPlaceholder: 'Search tasks by title, assignee...',
      searchFunction: (query: string) => this.searchTasks(query),
    },
    '/dashboard/analytics': {
      pageTitle: 'Analytics',
      searchPlaceholder: 'Search analytics...',
      searchFunction: (query: string) => this.searchAnalytics(query),
    },
    '/dashboard/settings': {
      pageTitle: 'Settings',
      searchPlaceholder: 'Search settings...',
      searchFunction: (query: string) => this.searchSettings(query),
    },
    '/dashboard/profile': {
      pageTitle: 'Profile',
      searchPlaceholder: 'Search profile information...',
      searchFunction: (query: string) => this.searchProfile(query),
    },
    '/dashboard/help': {
      pageTitle: 'Help & Documentation',
      searchPlaceholder: 'Search help articles...',
      searchFunction: (query: string) => this.searchHelp(query),
    },
  };

  constructor(private router: Router) {
    // Escuchar cambios de navegación
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageContext(event.urlAfterRedirects);
      });

    // Inicializar con la ruta actual
    this.updatePageContext(this.router.url);
  }

  /**
   * Obtiene el observable del contexto de página
   */
  getPageContext(): Observable<PageContext> {
    return this.pageContext$.asObservable();
  }

  /**
   * Actualiza el contexto basado en la URL actual
   */
  private updatePageContext(url: string): void {
    const config = this.pageConfigs[url] || {
      pageTitle: 'Dashboard',
      searchPlaceholder: 'Search...',
    };
    this.pageContext$.next(config);
  }

  // ========================================
  // Funciones de búsqueda para cada página
  // ========================================

  private searchDashboard(query: string): void {
    console.log('🔍 Searching dashboard:', query);
    // TODO: Implementar lógica de búsqueda del dashboard
    // Ejemplo: filtrar widgets, estadísticas, etc.
  }

  private searchProjects(query: string): void {
    console.log('🔍 Searching projects:', query);
    // TODO: Implementar lógica de búsqueda de proyectos
    // Ejemplo: filtrar por nombre, estado, fecha, etc.
  }

  private searchTasks(query: string): void {
    console.log('🔍 Searching tasks:', query);
    // TODO: Implementar lógica de búsqueda de tareas
    // Ejemplo: filtrar por título, asignado, prioridad, etc.
  }

  private searchAnalytics(query: string): void {
    console.log('🔍 Searching analytics:', query);
    // TODO: Implementar lógica de búsqueda de analytics
    // Ejemplo: buscar métricas específicas, reportes, etc.
  }

  private searchSettings(query: string): void {
    console.log('🔍 Searching settings:', query);
    // TODO: Implementar lógica de búsqueda de configuraciones
    // Ejemplo: buscar configuraciones específicas
  }

  private searchProfile(query: string): void {
    console.log('🔍 Searching profile:', query);
    // TODO: Implementar lógica de búsqueda en perfil
    // Ejemplo: buscar en información personal, actividad, etc.
  }

  private searchHelp(query: string): void {
    console.log('🔍 Searching help:', query);
    // TODO: Implementar lógica de búsqueda de ayuda
    // Ejemplo: buscar artículos, FAQs, documentación
  }
}
```

**Funcionalidades:**
- ✅ Define configuración específica por página
- ✅ Placeholder dinámico según la ruta
- ✅ Función de búsqueda específica por página
- ✅ Fácil agregar nuevas páginas
- ✅ Fallback a configuración por defecto

---

### Paso 4: Actualizar HeaderComponent

**Archivo:** `src/app/features/dashboard/components/header/header.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PageContextService } from '@core/services/page-context.service';
import { Breadcrumb, PageContext } from '@shared/models/breadcrumb.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatIconModule, RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  breadcrumbs: Breadcrumb[] = [];
  pageContext: PageContext = {
    pageTitle: 'Dashboard',
    searchPlaceholder: 'Search...',
  };
  searchQuery = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private breadcrumbService: BreadcrumbService,
    private pageContextService: PageContextService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los breadcrumbs
    this.breadcrumbService
      .getBreadcrumbs()
      .pipe(takeUntil(this.destroy$))
      .subscribe((breadcrumbs) => {
        this.breadcrumbs = breadcrumbs;
      });

    // Suscribirse al contexto de página
    this.pageContextService
      .getPageContext()
      .pipe(takeUntil(this.destroy$))
      .subscribe((context) => {
        this.pageContext = context;
      });
  }

  /**
   * Maneja el evento de búsqueda
   * Ejecuta la función específica de la página actual
   */
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    
    if (this.pageContext.searchFunction) {
      this.pageContext.searchFunction(query);
    }
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Cambios:**
- ✅ Importar `CommonModule` para directivas
- ✅ Importar `FormsModule` para ngModel
- ✅ Importar `RouterLink` para navegación
- ✅ Inyectar ambos servicios
- ✅ Suscribirse a breadcrumbs y page context
- ✅ Implementar `onSearch()` que ejecuta la función específica
- ✅ Cleanup con `takeUntil()` y `ngOnDestroy()`

---

### Paso 5: Actualizar header.html

**Archivo:** `src/app/features/dashboard/components/header/header.html`

```html
<header>
  <div class="header_container">
    <!-- Breadcrumbs Dinámicos -->
    <div class="breadcrumbs">
      @for (breadcrumb of breadcrumbs; track breadcrumb.url; let isLast = $last) {
        @if (!isLast) {
          <a [routerLink]="breadcrumb.url" class="breadcrumb-link">
            {{ breadcrumb.label }}
          </a>
          <span class="breadcrumb-separator">/</span>
        } @else {
          <span class="breadcrumb-active">{{ breadcrumb.label }}</span>
        }
      }
    </div>

    <!-- Search Bar con Placeholder Dinámico -->
    <div class="search_bar">
      <input
        type="text"
        [placeholder]="pageContext.searchPlaceholder"
        (input)="onSearch($event)"
        [(ngModel)]="searchQuery"
      />
      <mat-icon class="search-icon">search</mat-icon>
    </div>

    <!-- Notifications and New tasks -->
    <div class="header_actions">
      <button class="notification_button" aria-label="Notifications">
        <mat-icon fontIcon="notification_important"></mat-icon>
      </button>
      <button class="new_task_button">
        <mat-icon>add</mat-icon>
        New Task
      </button>
    </div>
  </div>
</header>
```

**Características:**
- ✅ Usa sintaxis `@for` de Angular 17+
- ✅ Links navegables excepto el último breadcrumb
- ✅ Placeholder dinámico desde `pageContext`
- ✅ Two-way binding con `[(ngModel)]`
- ✅ Ícono de búsqueda
- ✅ Accesibilidad mejorada

---

### Paso 6: Actualizar Estilos del Header

**Archivo:** `src/app/features/dashboard/components/header/header.scss`

```scss
header {
  // ...existing styles...
}header_container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  // ...existing styles...
}

// ========================================
// Breadcrumbs Styles
// ========================================
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  
  .breadcrumb-link {
    color: var(--text-secondary, #888);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 400;
    transition: color 0.2s ease;
    white-space: nowrap;
    
    &:hover {
      color: var(--primary-color, #007bff);
      text-decoration: none;
    }
    
    &:focus {
      outline: 2px solid var(--primary-color, #007bff);
      outline-offset: 2px;
      border-radius: 4px;
    }
  }
  
  .breadcrumb-separator {
    color: var(--text-secondary, #666);
    font-size: 0.875rem;
    user-select: none;
    pointer-events: none;
  }
  
  .breadcrumb-active {
    color: var(--text-primary, #fff);
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
  }
}

// ========================================
// Search Bar Styles
// ========================================
.search_bar {
  position: relative;
  flex: 1 1 auto;
  max-width: 500px;
  
  input {
    width: 100%;
    padding: 0.625rem 2.5rem 0.625rem 1rem;
    border: 1px solid var(--border-color, #333);
    border-radius: 8px;
    background-color: var(--input-bg, #1a1a1a);
    color: var(--text-primary, #fff);
    font-size: 0.875rem;
    transition: all 0.2s ease;
    
    &::placeholder {
      color: var(--text-secondary, #888);
    }
    
    &:focus {
      outline: none;
      border-color: var(--primary-color, #007bff);
      background-color: var(--input-bg-focus, #222);
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
    
    &:hover {
      border-color: var(--border-hover, #444);
    }
  }
  
  .search-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary, #888);
    pointer-events: none;
    font-size: 1.25rem;
    width: 20px;
    height: 20px;
  }
}

// ========================================
// Header Actions Styles
// ========================================
.header_actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 0 0 auto;
  
  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    font-weight: 500;
    
    mat-icon {
      font-size: 1.25rem;
      width: 20px;
      height: 20px;
    }
  }
  
  .notification_button {
    background-color: transparent;
    color: var(--text-secondary, #888);
    padding: 0.5rem;
    
    &:hover {
      background-color: var(--button-hover-bg, #2a2a2a);
      color: var(--text-primary, #fff);
    }
  }
  
  .new_task_button {
    background-color: var(--primary-color, #007bff);
    color: #fff;
    
    &:hover {
      background-color: var(--primary-hover, #0056b3);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

// ========================================
// Responsive Design
// ========================================
@media (max-width: 768px) {
  .header_container {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .breadcrumbs {
    order: 1;
    width: 100%;
  }
  
  .search_bar {
    order: 2;
    flex: 1 1 auto;
    max-width: none;
  }
  
  .header_actions {
    order: 3;
  }
}
```

**Características de Estilos:**
- ✅ Breadcrumbs con hover y focus states
- ✅ Search bar con ícono posicionado
- ✅ Animaciones suaves
- ✅ Accesibilidad (focus states)
- ✅ Responsive design
- ✅ Variables CSS para theming

---

### Paso 7: Configurar Rutas con Data de Breadcrumb

**Archivo:** `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        data: { breadcrumb: 'Dashboard' },
        loadChildren: () =>
          import('@features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'settings',
        data: { breadcrumb: 'Settings' },
        loadChildren: () =>
          import('@features/setting/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'profile',
        data: { breadcrumb: 'Profile' },
        loadChildren: () =>
          import('@features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () => import('@layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: 'dashboard' },
];
```

**Archivo:** `src/app/features/dashboard/dashboard.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Overview' },
    loadComponent: () => import('./pages/overview/overview').then((m) => m.Overview),
  },
  {
    path: 'projects',
    data: { breadcrumb: 'Projects' },
    loadComponent: () => import('./pages/projects/projects').then((m) => m.Projects),
  },
  {
    path: 'tasks',
    data: { breadcrumb: 'Tasks' },
    loadComponent: () => import('./pages/tasks/tasks').then((m) => m.Tasks),
  },
  {
    path: 'analytics',
    data: { breadcrumb: 'Analytics' },
    loadComponent: () => import('./pages/analytics/analytics').then((m) => m.Analytics),
  },
  {
    path: 'settings',
    data: { breadcrumb: 'Settings' },
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  {
    path: 'profile',
    data: { breadcrumb: 'Profile' },
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'help',
    data: { breadcrumb: 'Help' },
    loadComponent: () => import('./pages/help/help').then((m) => m.Help),
  },
  { path: '**', redirectTo: '' },
];
```

**Importante:**
- ✅ Agregar `data: { breadcrumb: 'Label' }` a cada ruta
- ✅ El BreadcrumbService lee estos labels automáticamente
- ✅ Funciona con lazy loading

---

### Paso 8: Exportar Modelos

**Archivo:** `src/app/shared/models/index.ts`

```typescript
export * from './breadcrumb.model';
// ...other exports...
```

---

## Flujo de Funcionamiento

### 1. Usuario Navega a `/dashboard/projects`

```
1. Router emite NavigationEnd
        ↓
2. BreadcrumbService escucha el evento
        ↓
3. Construye breadcrumbs:
   - Home (/)
   - Dashboard (/dashboard)
   - Projects (/dashboard/projects) [active]
        ↓
4. PageContextService escucha el evento
        ↓
5. Actualiza contexto:
   - pageTitle: "Projects"
   - searchPlaceholder: "Search projects by name, status..."
   - searchFunction: searchProjects()
        ↓
6. HeaderComponent recibe actualizaciones
        ↓
7. UI se actualiza automáticamente
   - Breadcrumbs: Home / Dashboard / Projects
   - Placeholder: "Search projects by name, status..."
   - Input ejecuta searchProjects() al escribir
```

---

## Casos de Uso Avanzados

### Breadcrumbs con Parámetros Dinámicos

Si necesitas breadcrumbs con IDs (ej: `/projects/:id`):

```typescript
// En dashboard.routes.ts
{
  path: 'projects/:id',
  data: { breadcrumb: 'Project Detail' }, // Label estático
  loadComponent: () => import('./pages/project-detail/project-detail').then((m) => m.ProjectDetail),
}
```

Para labels dinámicos (mostrar nombre del proyecto):

```typescript
// Modificar BreadcrumbService
private buildBreadcrumbs(
  route: ActivatedRoute,
  url: string = '',
  breadcrumbs: Breadcrumb[] = []
): Breadcrumb[] {
  // ...código existente...
  
  // Leer label dinámico desde route params
  const label = child.snapshot.data['breadcrumb'];
  const params = child.snapshot.params;
  
  // Si el label es una función, ejecutarla
  const finalLabel = typeof label === 'function' 
    ? label(params) 
    : label;
  
  if (finalLabel) {
    breadcrumbs.push({
      label: finalLabel,
      url,
      isActive: false,
    });
  }
  
  // ...resto del código...
}
```

Luego en las rutas:

```typescript
{
  path: 'projects/:id',
  data: { 
    breadcrumb: (params: any) => `Project #${params.id}` 
  },
  loadComponent: () => import('./pages/project-detail/project-detail').then((m) => m.ProjectDetail),
}
```

---

### Búsqueda Debounced (Optimizada)

Para evitar llamadas excesivas durante escritura rápida:

```typescript
// En HeaderComponent
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export class HeaderComponent implements OnInit, OnDestroy {
  private searchSubject$ = new Subject<string>();
  
  ngOnInit(): void {
    // ...subscripciones existentes...
    
    // Configurar búsqueda con debounce
    this.searchSubject$
      .pipe(
        debounceTime(300), // Esperar 300ms después de dejar de escribir
        distinctUntilChanged(), // Solo si el valor cambió
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        if (this.pageContext.searchFunction) {
          this.pageContext.searchFunction(query);
        }
      });
  }
  
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject$.next(input.value);
  }
}
```

---

### Búsqueda con Resultados en el Header

Si quieres mostrar resultados de búsqueda en un dropdown:

```typescript
// PageContextService
export interface PageContext {
  pageTitle: string;
  searchPlaceholder: string;
  searchFunction?: (query: string) => Observable<any[]>; // Retorna Observable
}

// HeaderComponent
searchResults: any[] = [];
showResults = false;

onSearch(event: Event): void {
  const input = event.target as HTMLInputElement;
  const query = input.value;
  
  if (this.pageContext.searchFunction && query.length > 2) {
    this.pageContext.searchFunction(query).subscribe((results) => {
      this.searchResults = results;
      this.showResults = true;
    });
  } else {
    this.searchResults = [];
    this.showResults = false;
  }
}
```

```html
<!-- En header.html -->
<div class="search_bar">
  <input
    type="text"
    [placeholder]="pageContext.searchPlaceholder"
    (input)="onSearch($event)"
    [(ngModel)]="searchQuery"
  />
  <mat-icon class="search-icon">search</mat-icon>
  
  @if (showResults && searchResults.length > 0) {
    <div class="search-results-dropdown">
      @for (result of searchResults; track result.id) {
        <div class="search-result-item">
          {{ result.name }}
        </div>
      }
    </div>
  }
</div>
```

---

## Agregar Nueva Página

Para agregar una nueva página al sistema:

### 1. Crear la ruta con breadcrumb

```typescript
// En dashboard.routes.ts
{
  path: 'reports',
  data: { breadcrumb: 'Reports' },
  loadComponent: () => import('./pages/reports/reports').then((m) => m.Reports),
}
```

### 2. Agregar configuración en PageContextService

```typescript
private pageConfigs: { [key: string]: PageContext } = {
  // ...configs existentes...
  '/dashboard/reports': {
    pageTitle: 'Reports',
    searchPlaceholder: 'Search reports by name, date...',
    searchFunction: (query: string) => this.searchReports(query),
  },
};

private searchReports(query: string): void {
  console.log('🔍 Searching reports:', query);
  // TODO: Implementar lógica de búsqueda
}
```

### 3. Listo! 🎉

El breadcrumb y el search placeholder se actualizarán automáticamente cuando navegues a `/dashboard/reports`.

---

## Testing

### Test para BreadcrumbService

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BreadcrumbService],
    });
    service = TestBed.inject(BreadcrumbService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate breadcrumbs on navigation', (done) => {
    service.getBreadcrumbs().subscribe((breadcrumbs) => {
      expect(breadcrumbs.length).toBeGreaterThan(0);
      expect(breadcrumbs[0].label).toBe('Home');
      done();
    });
  });
});
```

### Test para PageContextService

```typescript
import { TestBed } from '@angular/core/testing';
import { PageContextService } from './page-context.service';

describe('PageContextService', () => {
  let service: PageContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PageContextService],
    });
    service = TestBed.inject(PageContextService);
  });

  it('should return page context', (done) => {
    service.getPageContext().subscribe((context) => {
      expect(context).toBeDefined();
      expect(context.searchPlaceholder).toBeDefined();
      done();
    });
  });
});
```

### Test para HeaderComponent

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PageContextService } from '@core/services/page-context.service';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let breadcrumbService: jasmine.SpyObj<BreadcrumbService>;
  let pageContextService: jasmine.SpyObj<PageContextService>;

  beforeEach(async () => {
    const breadcrumbSpy = jasmine.createSpyObj('BreadcrumbService', ['getBreadcrumbs']);
    const pageContextSpy = jasmine.createSpyObj('PageContextService', ['getPageContext']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: BreadcrumbService, useValue: breadcrumbSpy },
        { provide: PageContextService, useValue: pageContextSpy },
      ],
    }).compileComponents();

    breadcrumbService = TestBed.inject(BreadcrumbService) as jasmine.SpyObj<BreadcrumbService>;
    pageContextService = TestBed.inject(PageContextService) as jasmine.SpyObj<PageContextService>;

    breadcrumbService.getBreadcrumbs.and.returnValue(of([]));
    pageContextService.getPageContext.and.returnValue(
      of({
        pageTitle: 'Test',
        searchPlaceholder: 'Search test...',
      })
    );

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update breadcrumbs', () => {
    const mockBreadcrumbs = [
      { label: 'Home', url: '/', isActive: false },
      { label: 'Dashboard', url: '/dashboard', isActive: true },
    ];
    breadcrumbService.getBreadcrumbs.and.returnValue(of(mockBreadcrumbs));
    component.ngOnInit();
    expect(component.breadcrumbs.length).toBe(2);
  });

  it('should call search function on input', () => {
    const mockSearchFn = jasmine.createSpy('searchFn');
    component.pageContext = {
      pageTitle: 'Test',
      searchPlaceholder: 'Search...',
      searchFunction: mockSearchFn,
    };

    const event = new Event('input');
    Object.defineProperty(event, 'target', {
      value: { value: 'test query' },
    });

    component.onSearch(event);
    expect(mockSearchFn).toHaveBeenCalledWith('test query');
  });
});
```

---

## Ventajas de Esta Implementación

| Característica | Beneficio |
|---------------|-----------|
| ✅ **Sin dependencias externas** | Más liviano, sin librerías de terceros |
| ✅ **Type-safe** | TypeScript completo, menos errores |
| ✅ **Reactivo** | Usa RxJS Observables, actualización automática |
| ✅ **Escalable** | Fácil agregar nuevas páginas |
| ✅ **Performance** | Compatible con lazy loading |
| ✅ **Mantenible** | Código limpio, bien organizado |
| ✅ **Flexible** | Cada página puede tener su propia lógica |
| ✅ **Testeable** | Servicios inyectables, fácil mockear |
| ✅ **Accesibilidad** | Focus states, ARIA labels |
| ✅ **Responsive** | Funciona en mobile y desktop |

---

## Troubleshooting

### Problema: Los breadcrumbs no aparecen

**Solución:**
1. Verifica que las rutas tengan `data: { breadcrumb: '...' }`
2. Asegúrate de que `BreadcrumbService` esté siendo inyectado
3. Revisa la consola por errores de importación

### Problema: El placeholder no cambia

**Solución:**
1. Verifica que la URL esté en `pageConfigs` en `PageContextService`
2. Asegúrate de que la URL coincida exactamente (con o sin trailing slash)
3. Revisa que `FormsModule` esté importado en el componente

### Problema: La función de búsqueda no se ejecuta

**Solución:**
1. Verifica que `searchFunction` esté definida en `pageConfigs`
2. Asegúrate de que el evento `(input)` esté correctamente enlazado
3. Revisa la consola por errores de ejecución

### Problema: Errores de path alias (@core, @shared)

**Solución:**
Asegúrate de tener configurado `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@layouts/*": ["src/app/layouts/*"]
    }
  }
}
```

---

## Próximos Pasos (Opcionales)

### 1. Breadcrumbs con Íconos
Agregar íconos a cada breadcrumb:

```typescript
export interface Breadcrumb {
  label: string;
  url: string;
  icon?: string; // Material icon name
  isActive?: boolean;
}
```

### 2. Breadcrumbs Colapsables en Mobile
Mostrar solo el actual y anterior en pantallas pequeñas:

```html
<div class="breadcrumbs">
  @if (isMobile && breadcrumbs.length > 2) {
    <button (click)="toggleBreadcrumbs()">
      <mat-icon>more_horiz</mat-icon>
    </button>
  }
  <!-- Mostrar breadcrumbs -->
</div>
```

### 3. Búsqueda Global
Implementar búsqueda que funcione en todas las páginas:

```typescript
// Global search en navigation service
searchGlobal(query: string): Observable<SearchResult[]> {
  return this.http.get<SearchResult[]>(`/api/search?q=${query}`);
}
```

### 4. Historial de Búsquedas
Guardar búsquedas recientes en localStorage:

```typescript
private saveSearchHistory(query: string): void {
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  history.unshift(query);
  localStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 10)));
}
```

### 5. Keyboard Shortcuts
Agregar atajos de teclado (Ctrl+K para focus en search):

```typescript
@HostListener('window:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    this.searchInput.nativeElement.focus();
  }
}
```

---

## Resumen

Esta implementación te proporciona:

1. **Breadcrumbs dinámicos** que se actualizan automáticamente
2. **Search placeholder dinámico** según la página actual
3. **Funciones de búsqueda específicas** por página
4. **Arquitectura escalable** y mantenible
5. **TypeScript type-safe** en toda la implementación
6. **Performance optimizado** con lazy loading
7. **Testing incluido** para mayor confiabilidad

¡Listo para implementar! 🚀
