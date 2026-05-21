import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LanguageStore, SupportedLanguage } from '../../../core/store/language.store';

// TODO(angular-logic-implementer): implement Material select/button for language switching
@Component({
  selector: 'asms-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class LanguageSwitcherComponent {
  protected readonly languageStore = inject(LanguageStore);
  private readonly translate = inject(TranslateService);

  readonly languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'fa', label: 'فارسی' }
  ];

  switchLanguage(code: SupportedLanguage): void {
    this.languageStore.setLanguage(code, this.translate);
  }
}
