import { Component, OnInit, inject, computed } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardStore } from './dashboard.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

interface RecentEvent {
  id: string;
  icon: string;
  iconClass: string;
  action: string;
  actor: string;
  time: string;
  severity: string;
  severityClass: string;
}

@Component({
  selector: 'asms-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    DecimalPipe,
    NgClass,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    TranslateModule,
    PageHeaderComponent
  ]
})
export class DashboardComponent implements OnInit {
  protected readonly store = inject(DashboardStore);

  readonly alertCount = computed(() => {
    const s = this.store.alertsBySeverity();
    if (!s) return 0;
    return (s.critical ?? 0) + (s.high ?? 0) + (s.medium ?? 0) + (s.low ?? 0);
  });

  // Realistic sample audit events from the spec
  readonly recentEvents: RecentEvent[] = [
    {
      id: '1',
      icon: 'admin_panel_settings',
      iconClass: 'event-icon--blue',
      action: 'Permission Group assigned: Finance Approver → Sarah Keller',
      actor: 'Daniel Weber',
      time: '2 min ago',
      severity: 'Medium',
      severityClass: 'chip-medium asms-chip'
    },
    {
      id: '2',
      icon: 'sms',
      iconClass: 'event-icon--green',
      action: 'Temporary password sent via SMS',
      actor: 'System',
      time: '14 min ago',
      severity: 'Low',
      severityClass: 'chip-low asms-chip'
    },
    {
      id: '3',
      icon: 'lock',
      iconClass: 'event-icon--red',
      action: 'User locked after failed login attempts',
      actor: 'ASMS Policy Engine',
      time: '1 hr ago',
      severity: 'High',
      severityClass: 'chip-high asms-chip'
    },
    {
      id: '4',
      icon: 'location_off',
      iconClass: 'event-icon--red',
      action: 'Station policy denied login — Legacy Core Banking',
      actor: 'ASMS Policy Engine',
      time: '2 hrs ago',
      severity: 'High',
      severityClass: 'chip-high asms-chip'
    },
    {
      id: '5',
      icon: 'person_add',
      iconClass: 'event-icon--blue',
      action: 'New user created: mina.rahimi@acme.com',
      actor: 'admin@asms.io',
      time: '3 hrs ago',
      severity: 'Low',
      severityClass: 'chip-low asms-chip'
    }
  ];

  ngOnInit(): void {
    this.store.loadSummary();
  }
}
