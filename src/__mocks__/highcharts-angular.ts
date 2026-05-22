// Jest mock for highcharts-angular
import { Component, Input, NgModule } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'highcharts-chart',
  template: '<div class="highcharts-mock"></div>',
  standalone: true
})
export class HighchartsChartComponent {
  @Input() Highcharts: unknown;
  @Input() options: unknown;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() update: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() oneToOne: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() runOutsideAngular: boolean = false;
}

@NgModule({
  imports: [HighchartsChartComponent],
  exports: [HighchartsChartComponent]
})
export class HighchartsChartModule {}
