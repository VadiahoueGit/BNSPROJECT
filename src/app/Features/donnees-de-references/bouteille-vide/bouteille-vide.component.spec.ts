import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BouteilleVideComponent } from './bouteille-vide.component';

describe('BouteilleVideComponent', () => {
  let component: BouteilleVideComponent;
  let fixture: ComponentFixture<BouteilleVideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BouteilleVideComponent]
    });
    fixture = TestBed.createComponent(BouteilleVideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
