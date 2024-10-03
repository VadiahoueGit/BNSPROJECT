import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CoreServiceService } from 'src/app/core/core-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  constructor(private _router: Router,
    private _auth : CoreServiceService
  ) {}
  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]), 
    });
  }

  ToConnect() {
    if (this.loginForm.valid) {
      this._auth.ToConnect(this.loginForm.value).then((res: any) => {
        console.log('res login = ');
        console.log(res);
        if (res) {
          console.log(res)
          console.log(this.loginForm.value);
          this._router.navigate(['dashboard']);
        }
      })

    }
  }

  ToForgetPassword() {
    this._router.navigate(['forget-password']);
  }
}
