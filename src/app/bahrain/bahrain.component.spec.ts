import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BahrainComponent } from './bahrain.component';

describe('BahrainComponent', () => {
  let component: BahrainComponent;
  let fixture: ComponentFixture<BahrainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BahrainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BahrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
