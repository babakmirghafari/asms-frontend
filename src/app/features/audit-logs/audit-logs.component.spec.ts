import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuditLogsComponent } from './audit-logs.component';

describe('AuditLogsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogsComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuditLogsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
