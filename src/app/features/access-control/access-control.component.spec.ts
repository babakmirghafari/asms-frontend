import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AccessControlComponent } from './access-control.component';

describe('AccessControlComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessControlComponent],
      providers: [provideRouter([]), provideHttpClient(), provideTranslateService({ defaultLanguage: 'en' })]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AccessControlComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
