import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDesReceptionsEmballagesComponent } from './list-des-receptions-emballages.component';

describe('ListDesReceptionsEmballagesComponent', () => {
  let component: ListDesReceptionsEmballagesComponent;
  let fixture: ComponentFixture<ListDesReceptionsEmballagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListDesReceptionsEmballagesComponent]
    });
    fixture = TestBed.createComponent(ListDesReceptionsEmballagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
