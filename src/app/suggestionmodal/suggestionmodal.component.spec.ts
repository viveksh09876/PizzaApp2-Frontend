import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionmodalComponent } from './suggestionmodal.component';

describe('SuggestionmodalComponent', () => {
  let component: SuggestionmodalComponent;
  let fixture: ComponentFixture<SuggestionmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestionmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestionmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
