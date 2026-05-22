import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ActivityLogsComponent } from './activity-logs.component';

describe('ActivityLogsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityLogsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideTranslateService({ defaultLanguage: 'en' })]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ActivityLogsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
