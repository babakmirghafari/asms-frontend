import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthPoliciesComponent } from './auth-policies.component';

describe('AuthPoliciesComponent', () => {
  let fixture: ComponentFixture<AuthPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPoliciesComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPoliciesComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
