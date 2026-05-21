import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// TODO(angular-logic-implementer): implement real Material template from DESIGN_SYSTEM
@Component({
  selector: 'asms-applications',
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class ApplicationsComponent {}
