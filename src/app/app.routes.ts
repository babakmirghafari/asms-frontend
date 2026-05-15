import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'organizations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/organizations/organizations.component').then(m => m.OrganizationsComponent)
  },
  {
    path: 'memberships',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/memberships/memberships.component').then(m => m.MembershipsComponent)
  },
  {
    path: 'permission-groups',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/permission-groups/permission-groups.component').then(m => m.PermissionGroupsComponent)
  },
  {
    path: 'permissions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/permissions/permissions.component').then(m => m.PermissionsComponent)
  },
  {
    path: 'access-control',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/access-control/access-control.component').then(m => m.AccessControlComponent)
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/applications.component').then(m => m.ApplicationsComponent)
  },
  {
    path: 'auth-policies',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth-policies/auth-policies.component').then(m => m.AuthPoliciesComponent)
  },
  {
    path: 'station-policies',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/station-policies/station-policies.component').then(m => m.StationPoliciesComponent)
  },
  {
    path: 'sessions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sessions/sessions.component').then(m => m.SessionsComponent)
  },
  {
    path: 'activity-logs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/activity-logs/activity-logs.component').then(m => m.ActivityLogsComponent)
  },
  {
    path: 'audit-logs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
  },
  {
    path: 'alerts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/alerts/alerts.component').then(m => m.AlertsComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
