import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationCommandeGratuiteComponent } from './validation-commande-gratuite.component';

describe('ValidationCommandeGratuiteComponent', () => {
  let component: ValidationCommandeGratuiteComponent;
  let fixture: ComponentFixture<ValidationCommandeGratuiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationCommandeGratuiteComponent]
    });
    fixture = TestBed.createComponent(ValidationCommandeGratuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
