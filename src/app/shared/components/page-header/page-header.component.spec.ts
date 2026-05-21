import { TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
