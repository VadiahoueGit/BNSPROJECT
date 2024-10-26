import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionvisiteComponent } from './gestionvisite.component';

describe('GestionvisiteComponent', () => {
  let component: GestionvisiteComponent;
  let fixture: ComponentFixture<GestionvisiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionvisiteComponent]
    });
    fixture = TestBed.createComponent(GestionvisiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
