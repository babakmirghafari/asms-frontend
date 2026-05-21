import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'asms-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  standalone: true,
  imports: [RouterLink]
})
export class NotFoundComponent {}
