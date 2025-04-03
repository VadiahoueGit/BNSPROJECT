import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeCommandesMarchandisesComponent } from './liste-commandes-marchandises.component';

describe('ListeCommandesMarchandisesComponent', () => {
  let component: ListeCommandesMarchandisesComponent;
  let fixture: ComponentFixture<ListeCommandesMarchandisesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeCommandesMarchandisesComponent]
    });
    fixture = TestBed.createComponent(ListeCommandesMarchandisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
