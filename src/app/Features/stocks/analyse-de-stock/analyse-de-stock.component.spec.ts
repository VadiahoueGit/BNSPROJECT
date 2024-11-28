import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyseDeStockComponent } from './analyse-de-stock.component';

describe('AnalyseDeStockComponent', () => {
  let component: AnalyseDeStockComponent;
  let fixture: ComponentFixture<AnalyseDeStockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyseDeStockComponent]
    });
    fixture = TestBed.createComponent(AnalyseDeStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
