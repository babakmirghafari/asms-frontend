import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// TODO(angular-logic-implementer): implement real Material template from DESIGN_SYSTEM
@Component({
  selector: 'asms-alerts',
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class AlertsComponent {}
