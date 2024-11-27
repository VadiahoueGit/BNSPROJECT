import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviCommandeGratuiteComponent } from './suivi-commande-gratuite.component';

describe('SuiviCommandeGratuiteComponent', () => {
  let component: SuiviCommandeGratuiteComponent;
  let fixture: ComponentFixture<SuiviCommandeGratuiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuiviCommandeGratuiteComponent]
    });
    fixture = TestBed.createComponent(SuiviCommandeGratuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
