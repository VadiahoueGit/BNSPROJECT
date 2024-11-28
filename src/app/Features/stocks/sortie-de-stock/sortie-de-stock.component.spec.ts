import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortieDeStockComponent } from './sortie-de-stock.component';

describe('SortieDeStockComponent', () => {
  let component: SortieDeStockComponent;
  let fixture: ComponentFixture<SortieDeStockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SortieDeStockComponent]
    });
    fixture = TestBed.createComponent(SortieDeStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
