import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandePayesPartiellementComponent } from './commande-payes-partiellement.component';

describe('CommandePayesPartiellementComponent', () => {
  let component: CommandePayesPartiellementComponent;
  let fixture: ComponentFixture<CommandePayesPartiellementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommandePayesPartiellementComponent]
    });
    fixture = TestBed.createComponent(CommandePayesPartiellementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
