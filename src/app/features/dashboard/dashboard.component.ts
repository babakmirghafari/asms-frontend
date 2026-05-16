import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DashboardStore } from './dashboard.store';

@Component({
  selector: 'asms-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent,
  ],
  providers: [DashboardStore],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly store = inject(DashboardStore);
  private snack  = inject(MatSnackBar);

  // TODO: replace with org context from AuthStore when org-select flow is implemented
  private readonly orgId = 'default';

  async ngOnInit(): Promise<void> {
    await this.store.load(this.orgId);
    if (this.store.error()) {
      this.snack.open(this.store.error()!, 'Dismiss', { duration: 5000 });
    }
  }

  async reload(): Promise<void> {
    await this.store.load(this.orgId);
  }
}
