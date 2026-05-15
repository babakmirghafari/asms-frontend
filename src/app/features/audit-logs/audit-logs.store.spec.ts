import { TestBed } from '@angular/core/testing';
import { AuditLogsStore } from './audit-logs.store';

describe('AuditLogsStore', () => {
  let store: InstanceType<typeof AuditLogsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditLogsStore],
    });
    store = TestBed.inject(AuditLogsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
