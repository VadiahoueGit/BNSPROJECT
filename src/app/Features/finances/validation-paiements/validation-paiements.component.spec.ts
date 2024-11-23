import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationPaiementsComponent } from './validation-paiements.component';

describe('ValidationPaiementsComponent', () => {
  let component: ValidationPaiementsComponent;
  let fixture: ComponentFixture<ValidationPaiementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationPaiementsComponent]
    });
    fixture = TestBed.createComponent(ValidationPaiementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
