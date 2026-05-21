import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLanguage = 'en' | 'fa';
export type LayoutDirection = 'ltr' | 'rtl';

const RTL_LANGUAGES: SupportedLanguage[] = ['fa'];

export interface LanguageState {
  language: SupportedLanguage;
}

function getStoredLanguage(): SupportedLanguage {
  const stored = localStorage.getItem('asms_language');
  if (stored === 'fa' || stored === 'en') return stored;
  return 'en';
}

export const LanguageStore = signalStore(
  { providedIn: 'root' },
  withState<LanguageState>({
    language: getStoredLanguage()
  }),
  withComputed((store) => ({
    direction: computed((): LayoutDirection =>
      RTL_LANGUAGES.includes(store.language()) ? 'rtl' : 'ltr'
    )
  })),
  withMethods((store) => ({
    setLanguage(language: SupportedLanguage, translateService: TranslateService): void {
      localStorage.setItem('asms_language', language);
      document.documentElement.lang = language;
      document.documentElement.dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
      translateService.use(language);
      patchState(store, { language });
    },
    initLanguage(translateService: TranslateService): void {
      const lang = store.language();
      document.documentElement.lang = lang;
      document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
      translateService.use(lang);
    }
  }))
);
