import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MembershipsComponent } from './memberships.component';

describe('MembershipsComponent', () => {
  let fixture: ComponentFixture<MembershipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipsComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
