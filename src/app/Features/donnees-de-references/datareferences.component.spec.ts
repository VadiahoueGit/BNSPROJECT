import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatareferencesComponent } from './datareferences.component';

describe('DatareferencesComponent', () => {
  let component: DatareferencesComponent;
  let fixture: ComponentFixture<DatareferencesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DatareferencesComponent]
    });
    fixture = TestBed.createComponent(DatareferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
