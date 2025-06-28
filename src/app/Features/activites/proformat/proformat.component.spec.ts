import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProformatComponent } from './proformat.component';

describe('ProformatComponent', () => {
  let component: ProformatComponent;
  let fixture: ComponentFixture<ProformatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProformatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProformatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
