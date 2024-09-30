import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent {
  constructor(private _router: Router) {}
  ngOnInit(): void {}


  ToOtpValidate(){

  }
}
