import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent, TranslateModule.forRoot()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LanguageSwitcherComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose english and farsi languages', () => {
    const fixture = TestBed.createComponent(LanguageSwitcherComponent);
    const codes = fixture.componentInstance.languages.map(l => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('fa');
  });
});
