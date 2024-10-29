import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviCommandeComponent } from './suivi-commande.component';

describe('SuiviCommandeComponent', () => {
  let component: SuiviCommandeComponent;
  let fixture: ComponentFixture<SuiviCommandeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuiviCommandeComponent]
    });
    fixture = TestBed.createComponent(SuiviCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
