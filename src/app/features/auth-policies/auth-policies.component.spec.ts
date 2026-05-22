import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthPoliciesComponent } from './auth-policies.component';

describe('AuthPoliciesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPoliciesComponent],
      providers: [provideRouter([]), provideHttpClient(), provideTranslateService({ defaultLanguage: 'en' })]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthPoliciesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
