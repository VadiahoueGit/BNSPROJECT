import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviComptesComponent } from './suivi-comptes.component';

describe('SuiviComptesComponent', () => {
  let component: SuiviComptesComponent;
  let fixture: ComponentFixture<SuiviComptesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuiviComptesComponent]
    });
    fixture = TestBed.createComponent(SuiviComptesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
