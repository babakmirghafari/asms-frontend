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
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'organizations',
        loadComponent: () =>
          import('./features/organizations/organizations.component').then(m => m.OrganizationsComponent)
      },
      {
        path: 'memberships',
        loadComponent: () =>
          import('./features/memberships/memberships.component').then(m => m.MembershipsComponent)
      },
      {
        path: 'permission-groups',
        loadComponent: () =>
          import('./features/permission-groups/permission-groups.component').then(m => m.PermissionGroupsComponent)
      },
      {
        path: 'permissions',
        loadComponent: () =>
          import('./features/permissions/permissions.component').then(m => m.PermissionsComponent)
      },
      {
        path: 'access-control',
        loadComponent: () =>
          import('./features/access-control/access-control.component').then(m => m.AccessControlComponent)
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/applications/applications.component').then(m => m.ApplicationsComponent)
      },
      {
        path: 'auth-policies',
        loadComponent: () =>
          import('./features/auth-policies/auth-policies.component').then(m => m.AuthPoliciesComponent)
      },
      {
        path: 'station-policies',
        loadComponent: () =>
          import('./features/station-policies/station-policies.component').then(m => m.StationPoliciesComponent)
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/sessions/sessions.component').then(m => m.SessionsComponent)
      },
      {
        path: 'activity-logs',
        loadComponent: () =>
          import('./features/activity-logs/activity-logs.component').then(m => m.ActivityLogsComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./features/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./features/alerts/alerts.component').then(m => m.AlertsComponent)
      },
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
