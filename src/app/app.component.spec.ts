import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { ApiModule, Configuration } from '@babakmirghafari/asms-api-client';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        ApiModule.forRoot(() => new Configuration({ basePath: '' })),
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideNoopAnimations()
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
