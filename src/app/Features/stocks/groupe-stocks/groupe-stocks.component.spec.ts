import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupeStocksComponent } from './groupe-stocks.component';

describe('GroupeStocksComponent', () => {
  let component: GroupeStocksComponent;
  let fixture: ComponentFixture<GroupeStocksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupeStocksComponent]
    });
    fixture = TestBed.createComponent(GroupeStocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
