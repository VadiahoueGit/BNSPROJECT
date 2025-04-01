import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntreeGratuiteComponent } from './entree-gratuite.component';

describe('EntreeGratuiteComponent', () => {
  let component: EntreeGratuiteComponent;
  let fixture: ComponentFixture<EntreeGratuiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntreeGratuiteComponent]
    });
    fixture = TestBed.createComponent(EntreeGratuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
