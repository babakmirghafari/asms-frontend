import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AccessControlComponent } from './access-control.component';

describe('AccessControlComponent', () => {
  let fixture: ComponentFixture<AccessControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessControlComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessControlComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
