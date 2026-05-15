import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { PermissionGroupsComponent } from './permission-groups.component';

describe('PermissionGroupsComponent', () => {
  let fixture: ComponentFixture<PermissionGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionGroupsComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionGroupsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
