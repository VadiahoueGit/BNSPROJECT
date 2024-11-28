import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntreenStockComponent } from './entreen-stock.component';

describe('EntreenStockComponent', () => {
  let component: EntreenStockComponent;
  let fixture: ComponentFixture<EntreenStockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntreenStockComponent]
    });
    fixture = TestBed.createComponent(EntreenStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
