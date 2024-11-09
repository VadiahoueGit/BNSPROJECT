import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneLivraisonComponent } from './zone-livraison.component';

describe('ZoneLivraisonComponent', () => {
  let component: ZoneLivraisonComponent;
  let fixture: ComponentFixture<ZoneLivraisonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ZoneLivraisonComponent]
    });
    fixture = TestBed.createComponent(ZoneLivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
