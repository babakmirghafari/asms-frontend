import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { OrganizationsComponent } from './organizations.component';

describe('OrganizationsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideTranslateService({ defaultLanguage: 'en' })]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OrganizationsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
