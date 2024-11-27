import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDesRetoursComponent } from './gestion-des-retours.component';

describe('GestionDesRetoursComponent', () => {
  let component: GestionDesRetoursComponent;
  let fixture: ComponentFixture<GestionDesRetoursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionDesRetoursComponent]
    });
    fixture = TestBed.createComponent(GestionDesRetoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
