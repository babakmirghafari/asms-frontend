import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { StationPoliciesComponent } from './station-policies.component';

describe('StationPoliciesComponent', () => {
  let fixture: ComponentFixture<StationPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationPoliciesComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(StationPoliciesComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
