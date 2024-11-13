import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlastiqueNuComponent } from './plastique-nu.component';

describe('PlastiqueNuComponent', () => {
  let component: PlastiqueNuComponent;
  let fixture: ComponentFixture<PlastiqueNuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlastiqueNuComponent]
    });
    fixture = TestBed.createComponent(PlastiqueNuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
