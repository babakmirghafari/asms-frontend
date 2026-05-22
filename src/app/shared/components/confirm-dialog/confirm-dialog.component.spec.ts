import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideTranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        provideTranslateService({ defaultLanguage: 'en' }),
        { provide: MAT_DIALOG_DATA, useValue: { titleKey: 'test', messageKey: 'test' } },
        { provide: MatDialogRef, useValue: { close: () => { return; } } }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
