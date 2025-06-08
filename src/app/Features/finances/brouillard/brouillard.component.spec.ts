import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrouillardComponent } from './brouillard.component';

describe('BrouillardComponent', () => {
  let component: BrouillardComponent;
  let fixture: ComponentFixture<BrouillardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrouillardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BrouillardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
