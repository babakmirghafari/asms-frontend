import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageStore } from './language.store';

describe('LanguageStore', () => {
  let store: InstanceType<typeof LanguageStore>;
  let translateService: TranslateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [LanguageStore]
    });
    store = TestBed.inject(LanguageStore);
    translateService = TestBed.inject(TranslateService);
  });

  it('should default to English LTR', () => {
    expect(store.language()).toBe('en');
    expect(store.direction()).toBe('ltr');
  });

  it('should switch to Farsi RTL', () => {
    store.setLanguage('fa', translateService);
    expect(store.language()).toBe('fa');
    expect(store.direction()).toBe('rtl');
  });
});
