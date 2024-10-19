import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationPrixComponent } from './creation-prix.component';

describe('CreationPrixComponent', () => {
  let component: CreationPrixComponent;
  let fixture: ComponentFixture<CreationPrixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreationPrixComponent]
    });
    fixture = TestBed.createComponent(CreationPrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
