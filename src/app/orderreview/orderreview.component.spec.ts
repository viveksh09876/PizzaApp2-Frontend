import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderreviewComponent } from './orderreview.component';

describe('OrderreviewComponent', () => {
  let component: OrderreviewComponent;
  let fixture: ComponentFixture<OrderreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
