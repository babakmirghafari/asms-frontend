import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AccessControlComponent } from './access-control.component';

describe('AccessControlComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessControlComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AccessControlComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
