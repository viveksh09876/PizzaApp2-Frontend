import { Directive, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DateRange } from './date-range';
 
declare var $:any;
 
@Directive({
  selector: '[appDateRangePick]'
})
export class DateRangePickDirective {
  @Input() options: Object = {};
  @Output() selected: any = new EventEmitter();
  dateRange:DateRange=new DateRange({});
  constructor(private elementRef: ElementRef) {}
 
  ngOnInit() {
    $(this.elementRef.nativeElement)
      .daterangepicker(this.options, this.dateCallback.bind(this));
  }
 
  dateCallback(start, end, label) {
    let message = `
      New date range selected:
      ${start.format('DD-MM-YYYY')} to ${end.format('DD-MM-YYYY')}
      (predefined range: ${label})
    `;
    this.dateRange.startDate=start.format('DD-MM-YYYY');
    this.dateRange.endDate=end.format('DD-MM-YYYY');
    this.selected.emit(this.dateRange);
  }
}