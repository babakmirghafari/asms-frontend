import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { PermissionsComponent } from './permissions.component';

describe('PermissionsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideTranslateService({ defaultLanguage: 'en' })]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PermissionsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
