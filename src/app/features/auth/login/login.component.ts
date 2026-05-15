import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'asms-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // TODO(angular-logic-implementer): implement login form, SSO/Enterprise Login options,
  // failed attempt counter, remember me, all error states (locked, inactive, station policy, first-login redirect)
}
