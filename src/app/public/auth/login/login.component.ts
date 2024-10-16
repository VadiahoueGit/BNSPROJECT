import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CoreServiceService } from 'src/app/core/core-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  isLoading:Boolean = false;
  submitError:Boolean = false;
  constructor(private _router: Router,
    private _auth : CoreServiceService,
    private _spinner :NgxSpinnerService
  ) {}
  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  async ToConnect() {
    this.isLoading = true;
    if (this.loginForm.valid) {
      try {
        await this._auth.ToConnect(this.loginForm.value).then((res: any) => {
          this.isLoading = false
          console.log(res);
          if (res.access_token) {
            this._router.navigate(['feature']);
          }
        });
      } catch (error) {
        this.isLoading = false
        this.handleError(error);
      }
    }
  }

  handleError(error: any) {
    if (error.status === 404) {
      console.log('Adresse non trouvée');
    } else if (error.status === 500) {
      console.log('Erreur interne du serveur');
    } else if (error.status === 401) {
      this.submitError = true
    } else {
      console.log('Une erreur est survenue');
    }
  }

  ToForgetPassword() {
    this._router.navigate(['forget-password']);
  }
}
