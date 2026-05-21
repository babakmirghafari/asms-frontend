import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { PermissionGroupsComponent } from './permission-groups.component';

describe('PermissionGroupsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionGroupsComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PermissionGroupsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
