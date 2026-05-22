import { Component, OnInit, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { LanguageStore } from './core/store/language.store';
import { AuthStore } from './core/store/auth.store';
import { LanguageSwitcherComponent } from './shared/components/language-switcher/language-switcher.component';

interface NavItem {
  route: string;
  icon: string;
  labelKey: string;
}

@Component({
  selector: 'asms-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslateModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    LanguageSwitcherComponent
  ]
})
export class AppComponent implements OnInit {
  protected readonly languageStore = inject(LanguageStore);
  protected readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly navItems: NavItem[] = [
    { route: '/dashboard', icon: 'dashboard', labelKey: 'NAV.DASHBOARD' },
    { route: '/users', icon: 'people', labelKey: 'NAV.USERS' },
    { route: '/organizations', icon: 'business', labelKey: 'NAV.ORGANIZATIONS' },
    { route: '/memberships', icon: 'group_add', labelKey: 'NAV.MEMBERSHIPS' },
    { route: '/permission-groups', icon: 'admin_panel_settings', labelKey: 'NAV.PERMISSION_GROUPS' },
    { route: '/applications', icon: 'apps', labelKey: 'NAV.APPLICATIONS' },
    { route: '/auth-policies', icon: 'policy', labelKey: 'NAV.AUTH_POLICIES' },
    { route: '/station-policies', icon: 'security', labelKey: 'NAV.STATION_POLICIES' },
    { route: '/sessions', icon: 'computer', labelKey: 'NAV.SESSIONS' },
    { route: '/audit-logs', icon: 'history', labelKey: 'NAV.AUDIT_LOGS' },
    { route: '/alerts', icon: 'notifications_active', labelKey: 'NAV.ALERTS' },
    { route: '/access-control', icon: 'lock', labelKey: 'NAV.ACCESS_CONTROL' },
    { route: '/permissions', icon: 'key', labelKey: 'NAV.PERMISSIONS' },
    { route: '/activity-logs', icon: 'timeline', labelKey: 'NAV.ACTIVITY_LOGS' }
  ];

  private readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly currentPageTitle = computed(() => {
    const route = this.currentRoute() ?? '';
    const segment = route.split('/')[1] ?? 'dashboard';
    const nav = this.navItems.find(n => n.route === `/${segment}`);
    return nav?.labelKey ?? 'NAV.DASHBOARD';
  });

  ngOnInit(): void {
    this.languageStore.initLanguage(this.translate);
  }

  logout(): void {
    this.authStore.clearToken();
  }
}
