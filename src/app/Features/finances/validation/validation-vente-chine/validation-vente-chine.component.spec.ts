import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationVenteChineComponent } from './validation-vente-chine.component';

describe('ValidationVenteChineComponent', () => {
  let component: ValidationVenteChineComponent;
  let fixture: ComponentFixture<ValidationVenteChineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationVenteChineComponent]
    });
    fixture = TestBed.createComponent(ValidationVenteChineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
