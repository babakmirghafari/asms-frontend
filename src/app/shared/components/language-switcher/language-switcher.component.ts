import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LanguageStore, SupportedLanguage } from '../../../core/store/language.store';

@Component({
  selector: 'asms-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule]
})
export class LanguageSwitcherComponent {
  protected readonly languageStore = inject(LanguageStore);
  private readonly translate = inject(TranslateService);

  readonly languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'fa', label: 'فارسی', flag: 'FA' }
  ];

  switchLanguage(code: SupportedLanguage): void {
    this.languageStore.setLanguage(code, this.translate);
  }
}
