import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'mfa',
    loadComponent: () => import('./mfa/mfa.component').then(m => m.MfaComponent)
  },
  {
    path: 'select-organization',
    loadComponent: () => import('./select-organization/select-organization.component').then(m => m.SelectOrganizationComponent)
  },
];
