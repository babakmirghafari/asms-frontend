import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface OrgItem {
  id: string; name: string; domain: string; initials: string;
  color: string; badge?: string; members: number; plan: string;
  region: string; lastAccess: string; tags: string[];
}

@Component({
  selector: 'asms-select-organization',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './select-organization.component.html',
  styleUrl: './select-organization.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOrganizationComponent {
  private router = inject(Router);

  readonly userEmail   = 'admin@northwind.com';
  readonly userInitial = 'A';

  searchQuery = '';
  selectedOrg: string | null = null;

  readonly orgs: OrgItem[] = [
    { id: '1', name: 'Acme Corp',  domain: 'acmecorp.com',  initials: 'AC', color: '#16a34a', badge: 'Primary',
      members: 6, plan: 'Enterprise', region: 'USA', lastAccess: 'Active now', tags: ['SOC2','ISO27001','GDPR'] },
    { id: '2', name: 'Beta LLC',   domain: 'betallc.com',   initials: 'BL', color: '#ea580c', badge: 'Sandbox',
      members: 3, plan: 'Business',   region: 'UK',  lastAccess: '2 hours ago', tags: ['GDPR'] },
    { id: '3', name: 'Gamma Inc',  domain: 'gammainc.com',  initials: 'GI', color: '#7c3aed',
      members: 2, plan: 'Business',   region: 'Japan', lastAccess: 'Yesterday', tags: ['ISO27001'] },
  ];

  readonly filteredOrgs = computed(() =>
    this.orgs.filter(o =>
      !this.searchQuery ||
      o.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      o.region.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      o.plan.toLowerCase().includes(this.searchQuery.toLowerCase())
    )
  );

  selectOrg(id: string): void { this.selectedOrg = id; }

  onContinue(): void {
    if (this.selectedOrg) this.router.navigate(['/dashboard']);
  }

  signOut(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/auth/login']);
  }
}
