import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MembershipsComponent } from './memberships.component';

describe('MembershipsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipsComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MembershipsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
