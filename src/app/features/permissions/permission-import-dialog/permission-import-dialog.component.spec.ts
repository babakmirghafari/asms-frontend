import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideTranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PermissionImportDialogComponent } from './permission-import-dialog.component';
import { PermissionsStore } from '../permissions.store';

describe('PermissionImportDialogComponent', () => {
  let fixture: ComponentFixture<PermissionImportDialogComponent>;
  let component: PermissionImportDialogComponent;
  let mockStore: jest.Mocked<InstanceType<typeof PermissionsStore>>;
  let mockDialogRef: jest.Mocked<MatDialogRef<PermissionImportDialogComponent>>;

  beforeEach(async () => {
    mockStore = {
      validateImport: jest.fn(),
      commitImport: jest.fn(),
      loadAll: jest.fn(),
    } as any;

    mockDialogRef = { close: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [PermissionImportDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: PermissionsStore, useValue: mockStore },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideRouter([]),
        provideHttpClient(),
        provideTranslateService({ defaultLanguage: 'en' })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on step 0', () => {
    expect(component.currentStep()).toBe(0);
  });

  it('Validate button should be disabled when no file is selected', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('[data-testid="validate-btn"]') as HTMLButtonElement;
    expect(button?.disabled).toBe(true);
  });

  it('should advance to step 1 after successful validation', async () => {
    mockStore.validateImport.mockResolvedValue({
      importId: 'import-id-1',
      totalRows: 3,
      validRows: 3,
      errorRows: 0,
      warningRows: 0,
      status: 'READY',
      issues: []
    } as any);

    const file = new File(['name,resource,action\ntest.r.read,test,READ'], 'test.csv');
    component.selectedFile.set(file);
    await component.validate();
    fixture.detectChanges();

    expect(component.currentStep()).toBe(1);
  });

  it('should set BLOCKED status when validation returns errors', async () => {
    mockStore.validateImport.mockResolvedValue({
      importId: 'import-id-2',
      totalRows: 2,
      validRows: 1,
      errorRows: 1,
      warningRows: 0,
      status: 'BLOCKED',
      issues: [{ lineNumber: 2, severity: 'ERROR', message: 'missing action' }]
    } as any);

    const file = new File(['name,resource,action\nbad,,'], 'bad.csv');
    component.selectedFile.set(file);
    await component.validate();
    fixture.detectChanges();

    expect(component.validateResponse()?.status).toBe('BLOCKED');
  });

  it('should advance to step 2 after commit and call loadAll on close', async () => {
    component.importId.set('import-id-3');
    mockStore.commitImport.mockResolvedValue({ importId: 'import-id-3', committed: 2, skipped: 0, failed: 0 } as any);
    mockStore.loadAll.mockResolvedValue(undefined);

    await component.commit();

    expect(component.currentStep()).toBe(2);
    expect(mockStore.loadAll).not.toHaveBeenCalled();
    component.close();
    expect(mockStore.loadAll).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
