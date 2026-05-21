import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { SessionsComponent } from './sessions.component';

describe('SessionsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SessionsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
