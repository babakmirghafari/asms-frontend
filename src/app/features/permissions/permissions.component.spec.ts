import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermissionsComponent } from './permissions.component';
import { PermissionsStore } from './permissions.store';
import { of } from 'rxjs';

describe('PermissionsComponent', () => {
  let fixture: ComponentFixture<PermissionsComponent>;
  let component: PermissionsComponent;
  let mockStore: jest.Mocked<InstanceType<typeof PermissionsStore>>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    mockStore = {
      loadAll: jest.fn().mockResolvedValue(undefined),
      create: jest.fn(),
      delete: jest.fn(),
      exportAll: jest.fn(),
      isLoading: jest.fn().mockReturnValue(false),
      isEmpty: jest.fn().mockReturnValue(true),
      items: jest.fn().mockReturnValue([]),
      totalElements: jest.fn().mockReturnValue(0),
      pageSize: jest.fn().mockReturnValue(20),
      pageIndex: jest.fn().mockReturnValue(0),
    } as any;

    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(null) })
    } as any;

    mockSnackBar = { open: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [PermissionsComponent, NoopAnimationsModule],
      providers: [
        { provide: PermissionsStore, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
        provideRouter([]),
        provideHttpClient(),
        provideTranslateService({ defaultLanguage: 'en' })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('exportCsv', () => {
    it('should call store.exportAll with current resource filter', async () => {
      const blob = new Blob(['id,name'], { type: 'text/csv' });
      mockStore.exportAll.mockResolvedValue(blob);

      component.searchCtrl.setValue('hr');
      await component.exportCsv();

      expect(mockStore.exportAll).toHaveBeenCalledWith({ resource: 'hr' });
    });

    it('should show error snackbar when export fails', async () => {
      mockStore.exportAll.mockRejectedValue(new Error('network error'));
      await component.exportCsv();
      expect(mockSnackBar.open).toHaveBeenCalled();
    });
  });

  describe('openImportDialog', () => {
    it('should open PermissionImportDialogComponent', () => {
      component.openImportDialog();
      expect(mockDialog.open).toHaveBeenCalled();
    });
  });
});
