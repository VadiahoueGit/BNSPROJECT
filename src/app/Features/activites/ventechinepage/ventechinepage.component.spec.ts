import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentechinepageComponent } from './ventechinepage.component';

describe('VentechinepageComponent', () => {
  let component: VentechinepageComponent;
  let fixture: ComponentFixture<VentechinepageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VentechinepageComponent]
    });
    fixture = TestBed.createComponent(VentechinepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
