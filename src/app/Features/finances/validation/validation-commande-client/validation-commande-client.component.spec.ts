import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationCommandeClientComponent } from './validation-commande-client.component';

describe('ValidationCommandeClientComponent', () => {
  let component: ValidationCommandeClientComponent;
  let fixture: ComponentFixture<ValidationCommandeClientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationCommandeClientComponent]
    });
    fixture = TestBed.createComponent(ValidationCommandeClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
