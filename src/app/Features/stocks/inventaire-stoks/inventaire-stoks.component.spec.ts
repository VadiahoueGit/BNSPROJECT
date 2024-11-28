import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventaireStoksComponent } from './inventaire-stoks.component';

describe('InventaireStoksComponent', () => {
  let component: InventaireStoksComponent;
  let fixture: ComponentFixture<InventaireStoksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InventaireStoksComponent]
    });
    fixture = TestBed.createComponent(InventaireStoksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
