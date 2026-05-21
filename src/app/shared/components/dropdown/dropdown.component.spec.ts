import { TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DropdownComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
