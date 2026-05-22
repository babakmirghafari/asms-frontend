import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { StationPoliciesComponent } from './station-policies.component';

describe('StationPoliciesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationPoliciesComponent],
      providers: [provideRouter([]), provideHttpClient(), provideTranslateService({ defaultLanguage: 'en' })]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StationPoliciesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
