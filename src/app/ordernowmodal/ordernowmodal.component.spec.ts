import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdernowmodalComponent } from './ordernowmodal.component';

describe('OrdernowmodalComponent', () => {
  let component: OrdernowmodalComponent;
  let fixture: ComponentFixture<OrdernowmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdernowmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdernowmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
