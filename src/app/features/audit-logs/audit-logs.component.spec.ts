import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuditLogsComponent } from './audit-logs.component';

describe('AuditLogsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideTranslateService({ defaultLanguage: 'en' })]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuditLogsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
