import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuivivisiteComponent } from './suivivisite.component';

describe('SuivivisiteComponent', () => {
  let component: SuivivisiteComponent;
  let fixture: ComponentFixture<SuivivisiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuivivisiteComponent]
    });
    fixture = TestBed.createComponent(SuivivisiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
