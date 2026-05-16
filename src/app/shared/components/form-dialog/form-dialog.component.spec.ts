import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FormDialogComponent, FormDialogData } from './form-dialog.component';

const mockDialogData: FormDialogData = {
  title: 'Create User',
  submitLabel: 'Save',
  cancelLabel: 'Cancel',
};

describe('FormDialogComponent', () => {
  let fixture: ComponentFixture<FormDialogComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<FormDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = { close: jest.fn() } as unknown as jest.Mocked<MatDialogRef<FormDialogComponent>>;

    await TestBed.configureTestingModule({
      imports: [FormDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormDialogComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the injected title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Create User');
  });

  it('should close with null when cancelled', () => {
    fixture.componentInstance.cancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should close with submit when submitted', () => {
    fixture.componentInstance.submit();
    expect(mockDialogRef.close).toHaveBeenCalledWith('submit');
  });
});
