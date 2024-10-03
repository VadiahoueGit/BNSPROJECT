import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoreServiceService } from 'src/app/core/core-service.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent {
  forgetData = {
    email: '',
  };
  constructor(private _router: Router, private _auth: CoreServiceService) {}
  ngOnInit(): void {}

  ToOtpVerify() {
    this._auth.ToVerifyPassword(this.forgetData).then((res) => {
      console.log(res);
      if (res) {
        this._router.navigate(['otp-screen']);
      }
    });
  }
}
