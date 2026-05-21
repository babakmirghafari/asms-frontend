import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AlertsComponent } from './alerts.component';

describe('AlertsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
