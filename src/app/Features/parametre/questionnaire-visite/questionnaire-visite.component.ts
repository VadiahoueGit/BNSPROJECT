import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-questionnaire-visite',
  templateUrl: './questionnaire-visite.component.html',
  styleUrls: ['./questionnaire-visite.component.scss']
})
export class QuestionnaireVisiteComponent {

  constructor(private location: Location,private cd: ChangeDetectorRef) {}


  goBack() {
    this.location.back()
  }
}
