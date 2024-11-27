import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviDesRDVComponent } from './suivi-des-rdv.component';

describe('SuiviDesRDVComponent', () => {
  let component: SuiviDesRDVComponent;
  let fixture: ComponentFixture<SuiviDesRDVComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuiviDesRDVComponent]
    });
    fixture = TestBed.createComponent(SuiviDesRDVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
