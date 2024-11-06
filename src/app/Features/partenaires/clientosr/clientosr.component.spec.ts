import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientosrComponent } from './clientosr.component';

describe('ClientosrComponent', () => {
  let component: ClientosrComponent;
  let fixture: ComponentFixture<ClientosrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientosrComponent]
    });
    fixture = TestBed.createComponent(ClientosrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
