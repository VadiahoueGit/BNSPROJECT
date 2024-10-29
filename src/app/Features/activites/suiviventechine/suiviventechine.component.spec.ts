import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviventechineComponent } from './suiviventechine.component';

describe('SuiviventechineComponent', () => {
  let component: SuiviventechineComponent;
  let fixture: ComponentFixture<SuiviventechineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuiviventechineComponent]
    });
    fixture = TestBed.createComponent(SuiviventechineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
