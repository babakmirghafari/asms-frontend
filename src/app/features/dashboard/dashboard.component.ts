import { Component, OnInit, inject, computed } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
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
    HighchartsChartModule,
    PageHeaderComponent
  ]
})
export class DashboardComponent implements OnInit {
  protected readonly store = inject(DashboardStore);
  readonly Highcharts = Highcharts;

  readonly alertCount = computed(() => {
    const s = this.store.alertsBySeverity();
    if (!s) return 0;
    return (s.critical ?? 0) + (s.high ?? 0) + (s.medium ?? 0) + (s.low ?? 0);
  });

  // User trends — realistic sample 12-week data
  readonly userTrendOptions: Highcharts.Options = {
    chart: {
      type: 'area',
      height: 200,
      backgroundColor: 'transparent',
      style: { fontFamily: 'Inter, Roboto, sans-serif' },
      margin: [10, 10, 40, 50]
    },
    title: { text: '' },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
      labels: { style: { color: '#546e7a', fontSize: '11px' } },
      lineColor: '#e0e0e0',
      tickColor: '#e0e0e0'
    },
    yAxis: {
      title: { text: '' },
      labels: { style: { color: '#546e7a', fontSize: '11px' } },
      gridLineColor: '#f0f0f0'
    },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
      style: { color: '#1a1a2e', fontSize: '12px' }
    },
    series: [
      {
        type: 'area',
        name: 'Active Users',
        data: [1180, 1210, 1195, 1230, 1245, 1260, 1278, 1290, 1310, 1295, 1320, 1340],
        color: '#3f51b5',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(63, 81, 181, 0.25)'],
            [1, 'rgba(63, 81, 181, 0.02)']
          ]
        },
        lineWidth: 2,
        marker: { enabled: false }
      }
    ]
  };

  // Session volume by day (last 7 days)
  readonly sessionVolumeOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      height: 200,
      backgroundColor: 'transparent',
      style: { fontFamily: 'Inter, Roboto, sans-serif' },
      margin: [10, 10, 40, 50]
    },
    title: { text: '' },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { color: '#546e7a', fontSize: '11px' } },
      lineColor: '#e0e0e0',
      tickColor: '#e0e0e0'
    },
    yAxis: {
      title: { text: '' },
      labels: { style: { color: '#546e7a', fontSize: '11px' } },
      gridLineColor: '#f0f0f0'
    },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
      style: { color: '#1a1a2e', fontSize: '12px' }
    },
    series: [
      {
        type: 'column',
        name: 'Sessions',
        data: [842, 918, 876, 934, 891, 423, 312],
        color: '#009688',
        borderRadius: 4,
        borderWidth: 0
      }
    ]
  };

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
      action: 'Temporary password sent via SMS to Mina Rahimi',
      actor: 'System',
      time: '14 min ago',
      severity: 'Low',
      severityClass: 'chip-low asms-chip'
    },
    {
      id: '3',
      icon: 'lock',
      iconClass: 'event-icon--red',
      action: 'User locked after 4 failed login attempts',
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
