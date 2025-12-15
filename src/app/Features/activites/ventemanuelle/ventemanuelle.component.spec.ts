import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentemanuelleComponent } from './ventemanuelle.component';

describe('VentemanuelleComponent', () => {
  let component: VentemanuelleComponent;
  let fixture: ComponentFixture<VentemanuelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentemanuelleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentemanuelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
