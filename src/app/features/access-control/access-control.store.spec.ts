import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AccessControlStore } from './access-control.store';

describe('AccessControlStore', () => {
  let store: InstanceType<typeof AccessControlStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessControlStore, provideHttpClient(), provideRouter([])]
    });
    store = TestBed.inject(AccessControlStore);
  });

  it('should initialise with null state', () => {
    expect(store.effectivePermissions()).toBeNull();
    expect(store.simulationResult()).toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('hasResult should be false initially', () => {
    expect(store.hasResult()).toBe(false);
  });
});
