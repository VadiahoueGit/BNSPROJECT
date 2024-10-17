import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupeProduitComponent } from './groupe-produit.component';

describe('GroupeProduitComponent', () => {
  let component: GroupeProduitComponent;
  let fixture: ComponentFixture<GroupeProduitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupeProduitComponent]
    });
    fixture = TestBed.createComponent(GroupeProduitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
