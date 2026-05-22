import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationsComponent } from './applications.component';

describe('ApplicationsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideTranslateService({ defaultLanguage: 'en' })]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ApplicationsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
