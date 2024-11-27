import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionsEmballagesComponent } from './receptions-emballages.component';

describe('ReceptionsEmballagesComponent', () => {
  let component: ReceptionsEmballagesComponent;
  let fixture: ComponentFixture<ReceptionsEmballagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceptionsEmballagesComponent]
    });
    fixture = TestBed.createComponent(ReceptionsEmballagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
