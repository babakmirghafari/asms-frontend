import { TestBed } from '@angular/core/testing';
import { StatusChipComponent } from './status-chip.component';

describe('StatusChipComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusChipComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StatusChipComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
