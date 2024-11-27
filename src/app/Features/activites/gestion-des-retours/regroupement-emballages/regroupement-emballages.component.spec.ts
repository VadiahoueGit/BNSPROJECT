import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegroupementEmballagesComponent } from './regroupement-emballages.component';

describe('RegroupementEmballagesComponent', () => {
  let component: RegroupementEmballagesComponent;
  let fixture: ComponentFixture<RegroupementEmballagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegroupementEmballagesComponent]
    });
    fixture = TestBed.createComponent(RegroupementEmballagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
