import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageStore } from './core/store/language.store';

@Component({
  selector: 'asms-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  protected readonly languageStore = inject(LanguageStore);
  private readonly translate = inject(TranslateService);

  ngOnInit(): void {
    this.languageStore.initLanguage(this.translate);
  }
}
