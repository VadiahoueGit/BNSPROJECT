import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousCompteComponent } from './sous-compte.component';

describe('SousCompteComponent', () => {
  let component: SousCompteComponent;
  let fixture: ComponentFixture<SousCompteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SousCompteComponent]
    });
    fixture = TestBed.createComponent(SousCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
