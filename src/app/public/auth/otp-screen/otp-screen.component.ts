import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp-screen',
  templateUrl: './otp-screen.component.html',
  styleUrls: ['./otp-screen.component.scss']
})
export class OtpScreenComponent {
  constructor(private _router: Router) {}
  ngOnInit(): void {}
  
  ToOtpVerify(){
    this._router.navigate(['new-password'])
  }
  onOtpChange(event:any) {
   
  }
}
