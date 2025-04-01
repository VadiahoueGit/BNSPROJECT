import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionMarchandiseComponent } from './reception-marchandise.component';

describe('ReceptionMarchandiseComponent', () => {
  let component: ReceptionMarchandiseComponent;
  let fixture: ComponentFixture<ReceptionMarchandiseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceptionMarchandiseComponent]
    });
    fixture = TestBed.createComponent(ReceptionMarchandiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
