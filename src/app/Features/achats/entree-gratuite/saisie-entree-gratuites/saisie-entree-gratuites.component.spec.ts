import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieEntreeGratuitesComponent } from './saisie-entree-gratuites.component';

describe('SaisieEntreeGratuitesComponent', () => {
  let component: SaisieEntreeGratuitesComponent;
  let fixture: ComponentFixture<SaisieEntreeGratuitesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaisieEntreeGratuitesComponent]
    });
    fixture = TestBed.createComponent(SaisieEntreeGratuitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
