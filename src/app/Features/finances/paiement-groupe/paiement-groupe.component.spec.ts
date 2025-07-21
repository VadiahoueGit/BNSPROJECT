import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementGroupeComponent } from './paiement-groupe.component';

describe('PaiementGroupeComponent', () => {
  let component: PaiementGroupeComponent;
  let fixture: ComponentFixture<PaiementGroupeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementGroupeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaiementGroupeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
