import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MouvementStockComponent } from './mouvement-stock.component';

describe('MouvementStockComponent', () => {
  let component: MouvementStockComponent;
  let fixture: ComponentFixture<MouvementStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MouvementStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MouvementStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
