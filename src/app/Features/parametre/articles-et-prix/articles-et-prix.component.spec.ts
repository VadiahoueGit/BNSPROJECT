import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesEtPrixComponent } from './articles-et-prix.component';

describe('ArticlesEtPrixComponent', () => {
  let component: ArticlesEtPrixComponent;
  let fixture: ComponentFixture<ArticlesEtPrixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArticlesEtPrixComponent]
    });
    fixture = TestBed.createComponent(ArticlesEtPrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
