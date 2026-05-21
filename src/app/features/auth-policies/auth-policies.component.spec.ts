import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthPoliciesComponent } from './auth-policies.component';

describe('AuthPoliciesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPoliciesComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthPoliciesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
