import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandePayesComponent } from './commande-payes.component';

describe('CommandePayesComponent', () => {
  let component: CommandePayesComponent;
  let fixture: ComponentFixture<CommandePayesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommandePayesComponent]
    });
    fixture = TestBed.createComponent(CommandePayesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
