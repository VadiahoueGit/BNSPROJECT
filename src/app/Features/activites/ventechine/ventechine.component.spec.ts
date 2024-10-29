import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentechineComponent } from './ventechine.component';

describe('VentechineComponent', () => {
  let component: VentechineComponent;
  let fixture: ComponentFixture<VentechineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VentechineComponent]
    });
    fixture = TestBed.createComponent(VentechineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
