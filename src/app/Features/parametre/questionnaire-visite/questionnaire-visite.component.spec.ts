import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireVisiteComponent } from './questionnaire-visite.component';

describe('QuestionnaireVisiteComponent', () => {
  let component: QuestionnaireVisiteComponent;
  let fixture: ComponentFixture<QuestionnaireVisiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionnaireVisiteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuestionnaireVisiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
