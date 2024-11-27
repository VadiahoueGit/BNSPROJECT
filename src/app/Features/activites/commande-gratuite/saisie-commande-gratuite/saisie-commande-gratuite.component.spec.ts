import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieCommandeGratuiteComponent } from './saisie-commande-gratuite.component';

describe('SaisieCommandeGratuiteComponent', () => {
  let component: SaisieCommandeGratuiteComponent;
  let fixture: ComponentFixture<SaisieCommandeGratuiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaisieCommandeGratuiteComponent]
    });
    fixture = TestBed.createComponent(SaisieCommandeGratuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
