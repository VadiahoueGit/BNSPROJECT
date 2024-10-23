import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmballageComponent } from './emballage.component';

describe('EmballageComponent', () => {
  let component: EmballageComponent;
  let fixture: ComponentFixture<EmballageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmballageComponent]
    });
    fixture = TestBed.createComponent(EmballageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
