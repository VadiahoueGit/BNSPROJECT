import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualisationDeStockComponent } from './visualisation-de-stock.component';

describe('VisualisationDeStockComponent', () => {
  let component: VisualisationDeStockComponent;
  let fixture: ComponentFixture<VisualisationDeStockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisualisationDeStockComponent]
    });
    fixture = TestBed.createComponent(VisualisationDeStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
