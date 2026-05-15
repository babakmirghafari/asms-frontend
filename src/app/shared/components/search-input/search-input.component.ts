import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'asms-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  @Input() placeholder = 'Search...';
  @Output() searchChange = new EventEmitter<string>();
  readonly control = new FormControl('');

  constructor() {
    this.control.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(v => this.searchChange.emit(v ?? ''));
  }

  // TODO(angular-logic-implementer): add MatFormFieldModule, MatInputModule, MatIconModule imports
}
