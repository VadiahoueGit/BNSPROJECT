import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementenattenteComponent } from './paiementenattente.component';

describe('PaiementenattenteComponent', () => {
  let component: PaiementenattenteComponent;
  let fixture: ComponentFixture<PaiementenattenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementenattenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaiementenattenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
