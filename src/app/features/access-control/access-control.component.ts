import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

interface EffectivePermResult {
  userId: string;
  permissions: string[];
  groups: string[];
  resolvedAt: Date;
}

interface SimResult {
  decision: 'ALLOW' | 'DENY';
  resource: string;
  action: string;
  reasons: string[];
}

@Component({
  selector: 'asms-access-control',
  standalone: true,
  imports: [
    FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule, PageHeaderComponent,
  ],
  templateUrl: './access-control.component.html',
  styleUrl: './access-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessControlComponent {
  readonly actionOptions = ['READ', 'WRITE', 'DELETE', 'ADMIN'];

  lookupUserId = 'alice.morgan';
  lookupOrgId = 'default';
  simUserId = 'alice.morgan';
  simOrgId = 'default';
  simResource = 'users';
  simAction = 'READ';

  readonly effectiveResult = signal<EffectivePermResult | null>(null);
  readonly simResult = signal<SimResult | null>(null);
  readonly lookupLoading = signal(false);
  readonly simLoading = signal(false);

  // Mock permission data keyed by userId
  private readonly mockPerms: Record<string, { permissions: string[]; groups: string[] }> = {
    'alice.morgan': { permissions: ['users:read','users:write','orgs:read','orgs:write','sessions:revoke','alerts:manage','audit:export','policy:update','apps:manage'], groups: ['Super Admins','Security Team'] },
    'bob.chen':     { permissions: ['users:read','orgs:read','apps:manage','reports:view'], groups: ['Developers'] },
    'dana.patel':   { permissions: ['users:read','orgs:read','reports:view'], groups: ['HR Managers','Support Staff'] },
  };

  lookup(): void {
    this.lookupLoading.set(true);
    setTimeout(() => {
      const data = this.mockPerms[this.lookupUserId] ?? { permissions: ['users:read'], groups: ['Viewers'] };
      this.effectiveResult.set({ userId: this.lookupUserId, ...data, resolvedAt: new Date() });
      this.lookupLoading.set(false);
    }, 500);
  }

  simulate(): void {
    this.simLoading.set(true);
    setTimeout(() => {
      const data = this.mockPerms[this.simUserId];
      const permName = `${this.simResource}:${this.simAction.toLowerCase()}`;
      const hasWild = data?.permissions.some(p => p.includes(this.simResource) && (p.includes('admin') || p.includes('write')));
      const hasExact = data?.permissions.includes(permName);
      const allowed = !!(hasExact || hasWild);
      this.simResult.set({
        decision: allowed ? 'ALLOW' : 'DENY',
        resource: this.simResource,
        action: this.simAction,
        reasons: allowed
          ? [`Permission "${permName}" found in effective permissions`, `User is member of group with access`]
          : [`Permission "${permName}" not found in effective permissions`, `No group grants this access level`],
      });
      this.simLoading.set(false);
    }, 600);
  }
}
