import { TestBed } from '@angular/core/testing';
import { PermissionsStore } from './permissions.store';
import { PermissionsService } from '@babakmirghafari/asms-api-client';
import { of } from 'rxjs';

describe('PermissionsStore', () => {
  let store: InstanceType<typeof PermissionsStore>;
  let svc: jest.Mocked<PermissionsService>;

  beforeEach(() => {
    svc = {
      listPermissions: jest.fn(),
      createPermission: jest.fn(),
      deletePermission: jest.fn(),
      validatePermissionsImport: jest.fn(),
      commitPermissionsImport: jest.fn(),
      exportPermissions: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        PermissionsStore,
        { provide: PermissionsService, useValue: svc }
      ]
    });
    store = TestBed.inject(PermissionsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
  });

  describe('validateImport', () => {
    it('should return validate response from the API', async () => {
      const mockResponse = {
        importId: 'abc-123',
        totalRows: 5,
        validRows: 4,
        errorRows: 1,
        warningRows: 0,
        status: 'READY',
        issues: []
      };
      svc.validatePermissionsImport.mockReturnValue(of(mockResponse as any));

      const file = new File(['name,resource,action\ntest.r.read,test,READ'], 'test.csv', { type: 'text/csv' });
      const result = await store.validateImport(file, 'org-id-1');

      expect(result.importId).toBe('abc-123');
      expect(result.totalRows).toBe(5);
    });
  });

  describe('commitImport', () => {
    it('should return commit response from the API', async () => {
      const mockResponse = { importId: 'abc-123', committed: 4, skipped: 1, failed: 0 };
      svc.commitPermissionsImport.mockReturnValue(of(mockResponse as any));

      const result = await store.commitImport('abc-123');

      expect(result.committed).toBe(4);
      expect(result.skipped).toBe(1);
    });
  });

  describe('exportAll', () => {
    it('should return a Blob when export succeeds', async () => {
      const csvContent = 'id,name\n123,test.read';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      (svc as any).exportPermissions.mockReturnValue(of(blob as any));

      const result = await store.exportAll({ resource: 'test' });

      expect(result).toBeInstanceOf(Blob);
    });
  });
});
