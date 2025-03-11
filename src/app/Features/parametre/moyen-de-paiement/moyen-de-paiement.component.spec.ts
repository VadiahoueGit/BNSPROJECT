import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoyenDePaiementComponent } from './moyen-de-paiement.component';

describe('MoyenDePaiementComponent', () => {
  let component: MoyenDePaiementComponent;
  let fixture: ComponentFixture<MoyenDePaiementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoyenDePaiementComponent]
    });
    fixture = TestBed.createComponent(MoyenDePaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
