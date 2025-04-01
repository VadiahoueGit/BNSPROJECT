import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoiqueGestionRetoursComponent } from './histoique-gestion-retours.component';

describe('HistoiqueGestionRetoursComponent', () => {
  let component: HistoiqueGestionRetoursComponent;
  let fixture: ComponentFixture<HistoiqueGestionRetoursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoiqueGestionRetoursComponent]
    });
    fixture = TestBed.createComponent(HistoiqueGestionRetoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
