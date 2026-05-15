import { TestBed } from '@angular/core/testing';
import { OrganizationsStore } from './organizations.store';

describe('OrganizationsStore', () => {
  let store: InstanceType<typeof OrganizationsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizationsStore],
    });
    store = TestBed.inject(OrganizationsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
