import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FranchisingComponent } from './franchising.component';

describe('FranchisingComponent', () => {
  let component: FranchisingComponent;
  let fixture: ComponentFixture<FranchisingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FranchisingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FranchisingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
