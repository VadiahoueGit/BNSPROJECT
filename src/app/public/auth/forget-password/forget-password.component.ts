import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent {
  constructor(private _router: Router) {}
  ngOnInit(): void {}

  ToOtpVerify() {
    this._router.navigate(['otp-screen'])
  }

 
}
