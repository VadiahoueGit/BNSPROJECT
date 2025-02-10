import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteGlobalFacturesComponent } from './vente-global-factures.component';

describe('VenteGlobalFacturesComponent', () => {
  let component: VenteGlobalFacturesComponent;
  let fixture: ComponentFixture<VenteGlobalFacturesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VenteGlobalFacturesComponent]
    });
    fixture = TestBed.createComponent(VenteGlobalFacturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
