import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcartEmballageComponent } from './ecart-emballage.component';

describe('EcartEmballageComponent', () => {
  let component: EcartEmballageComponent;
  let fixture: ComponentFixture<EcartEmballageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EcartEmballageComponent]
    });
    fixture = TestBed.createComponent(EcartEmballageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
