import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationCommandeComponent } from './validation-commande.component';

describe('ValidationCommandeComponent', () => {
  let component: ValidationCommandeComponent;
  let fixture: ComponentFixture<ValidationCommandeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationCommandeComponent]
    });
    fixture = TestBed.createComponent(ValidationCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});