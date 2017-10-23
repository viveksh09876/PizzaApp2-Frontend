import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavmodalComponent } from './favmodal.component';

describe('FavmodalComponent', () => {
  let component: FavmodalComponent;
  let fixture: ComponentFixture<FavmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
