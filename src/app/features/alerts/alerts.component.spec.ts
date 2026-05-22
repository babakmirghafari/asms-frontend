import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AlertsComponent } from './alerts.component';

describe('AlertsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideTranslateService({ defaultLanguage: 'en' })]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
