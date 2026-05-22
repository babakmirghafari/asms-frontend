import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'asms-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  standalone: true,
  imports: [TranslateModule, MatButtonModule, MatIconModule]
})
export class PageHeaderComponent {
  @Input() titleKey = '';
  @Input() subtitleKey = '';
  @Input() addLabelKey = 'COMMON.ADD';
  @Input() showAdd = false;
  @Output() addClicked = new EventEmitter<void>();
}
