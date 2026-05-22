import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';

export interface DropdownOption {
  value: string;
  labelKey: string;
}

@Component({
  selector: 'asms-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  standalone: true,
  imports: [MatSelectModule, MatFormFieldModule, ReactiveFormsModule, TranslateModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements ControlValueAccessor {
  @Input() labelKey = '';
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = '';
  @Output() selectionChange = new EventEmitter<string>();

  value = '';
  disabled = false;
  private onChange: (v: string) => void = (v) => { void v; };
  private onTouched: () => void = () => { return; };

  writeValue(val: string): void { this.value = val; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onSelect(val: string): void {
    this.value = val;
    this.onChange(val);
    this.onTouched();
    this.selectionChange.emit(val);
  }
}
