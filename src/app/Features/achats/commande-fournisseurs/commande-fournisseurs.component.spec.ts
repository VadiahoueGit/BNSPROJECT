import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeFournisseursComponent } from './commande-fournisseurs.component';

describe('CommandeFournisseursComponent', () => {
  let component: CommandeFournisseursComponent;
  let fixture: ComponentFixture<CommandeFournisseursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommandeFournisseursComponent]
    });
    fixture = TestBed.createComponent(CommandeFournisseursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
