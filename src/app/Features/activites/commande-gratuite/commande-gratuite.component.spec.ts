import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeGratuiteComponent } from './commande-gratuite.component';

describe('CommandeGratuiteComponent', () => {
  let component: CommandeGratuiteComponent;
  let fixture: ComponentFixture<CommandeGratuiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommandeGratuiteComponent]
    });
    fixture = TestBed.createComponent(CommandeGratuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
