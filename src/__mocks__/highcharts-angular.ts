// Jest mock for highcharts-angular
import { Component, Input, NgModule } from '@angular/core';

@Component({
  selector: 'highcharts-chart',
  template: '<div class="highcharts-mock"></div>',
  standalone: true
})
export class HighchartsChartComponent {
  @Input() Highcharts: unknown;
  @Input() options: unknown;
  @Input() update: boolean = false;
  @Input() oneToOne: boolean = false;
  @Input() runOutsideAngular: boolean = false;
}

@NgModule({
  imports: [HighchartsChartComponent],
  exports: [HighchartsChartComponent]
})
export class HighchartsChartModule {}
