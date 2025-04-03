import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEmballagesComponent } from './list-emballages.component';

describe('ListEmballagesComponent', () => {
  let component: ListEmballagesComponent;
  let fixture: ComponentFixture<ListEmballagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListEmballagesComponent]
    });
    fixture = TestBed.createComponent(ListEmballagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
