import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplynowComponent } from './applynow.component';

describe('ApplynowComponent', () => {
  let component: ApplynowComponent;
  let fixture: ComponentFixture<ApplynowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplynowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplynowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
