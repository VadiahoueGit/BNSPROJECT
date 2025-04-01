import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCommandeFournisseursComponent } from './create-commande-fournisseurs.component';

describe('CreateCommandeFournisseursComponent', () => {
  let component: CreateCommandeFournisseursComponent;
  let fixture: ComponentFixture<CreateCommandeFournisseursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateCommandeFournisseursComponent]
    });
    fixture = TestBed.createComponent(CreateCommandeFournisseursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
