import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquideComponent } from './liquide.component';

describe('LiquideComponent', () => {
  let component: LiquideComponent;
  let fixture: ComponentFixture<LiquideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiquideComponent]
    });
    fixture = TestBed.createComponent(LiquideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
