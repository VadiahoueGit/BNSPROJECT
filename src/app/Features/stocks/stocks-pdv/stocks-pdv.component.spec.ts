import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StocksPdvComponent } from './stocks-pdv.component';

describe('StocksPdvComponent', () => {
  let component: StocksPdvComponent;
  let fixture: ComponentFixture<StocksPdvComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StocksPdvComponent]
    });
    fixture = TestBed.createComponent(StocksPdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
