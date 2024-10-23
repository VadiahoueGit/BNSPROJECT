import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransporteurComponent } from './transporteur.component';

describe('TransporteurComponent', () => {
  let component: TransporteurComponent;
  let fixture: ComponentFixture<TransporteurComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransporteurComponent]
    });
    fixture = TestBed.createComponent(TransporteurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
