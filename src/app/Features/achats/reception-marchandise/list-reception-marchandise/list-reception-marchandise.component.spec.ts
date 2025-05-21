import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListReceptionMarchandiseComponent } from './list-reception-marchandise.component';

describe('ListReceptionMarchandiseComponent', () => {
  let component: ListReceptionMarchandiseComponent;
  let fixture: ComponentFixture<ListReceptionMarchandiseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListReceptionMarchandiseComponent]
    });
    fixture = TestBed.createComponent(ListReceptionMarchandiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
