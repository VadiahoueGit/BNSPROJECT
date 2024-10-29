import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandesClientsComponent } from './commandes-clients.component';

describe('CommandesClientsComponent', () => {
  let component: CommandesClientsComponent;
  let fixture: ComponentFixture<CommandesClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommandesClientsComponent]
    });
    fixture = TestBed.createComponent(CommandesClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
