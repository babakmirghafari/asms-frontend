import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { PermissionsComponent } from './permissions.component';

describe('PermissionsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PermissionsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
