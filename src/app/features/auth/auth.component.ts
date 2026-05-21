import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// TODO(angular-logic-implementer): implement login form, MFA flow, org-selection, first-login, blocked states
@Component({
  selector: 'asms-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class AuthComponent {}
