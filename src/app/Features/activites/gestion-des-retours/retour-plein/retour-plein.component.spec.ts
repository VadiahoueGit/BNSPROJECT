import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetourPleinComponent } from './retour-plein.component';

describe('RetourPleinComponent', () => {
  let component: RetourPleinComponent;
  let fixture: ComponentFixture<RetourPleinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RetourPleinComponent]
    });
    fixture = TestBed.createComponent(RetourPleinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
