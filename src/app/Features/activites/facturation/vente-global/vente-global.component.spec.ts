import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteGlobalComponent } from './vente-global.component';

describe('VenteGlobalComponent', () => {
  let component: VenteGlobalComponent;
  let fixture: ComponentFixture<VenteGlobalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VenteGlobalComponent]
    });
    fixture = TestBed.createComponent(VenteGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
