import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventaireDepotComponent } from './inventaire-depot.component';

describe('InventaireDepotComponent', () => {
  let component: InventaireDepotComponent;
  let fixture: ComponentFixture<InventaireDepotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InventaireDepotComponent]
    });
    fixture = TestBed.createComponent(InventaireDepotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
