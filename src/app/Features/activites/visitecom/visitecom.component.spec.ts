import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitecomComponent } from './visitecom.component';

describe('VisitecomComponent', () => {
  let component: VisitecomComponent;
  let fixture: ComponentFixture<VisitecomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisitecomComponent]
    });
    fixture = TestBed.createComponent(VisitecomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
