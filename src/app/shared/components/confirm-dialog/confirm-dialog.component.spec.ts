import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

const mockDialogData: ConfirmDialogData = {
  title: 'Confirm Delete',
  message: 'Are you sure?',
  confirmLabel: 'Delete',
  danger: true,
};

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<ConfirmDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = { close: jest.fn() } as unknown as jest.Mocked<MatDialogRef<ConfirmDialogComponent>>;

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display title and message from injected data', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Confirm Delete');
    expect(el.textContent).toContain('Are you sure?');
  });

  it('should close with true when confirmed', () => {
    fixture.componentInstance.confirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close with false when cancelled', () => {
    fixture.componentInstance.cancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
