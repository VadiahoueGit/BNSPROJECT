import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { LocalStorageService } from 'src/app/core/local-storage.service';
import { storage_keys } from 'src/app/Features/shared-component/utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  isLoading:Boolean = false;
  submitError:Boolean = false;
  testVersion:boolean = false;
  constructor(private _router: Router,
    private localstorage:LocalStorageService,
    private _auth : CoreServiceService,
    private _spinner :NgxSpinnerService
  ) {}
  ngOnInit(): void {
    // 🔍 Détection automatique de l’environnement
    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname.includes('test') ||
      hostname.includes('staging') ||
      hostname.includes('local') ||
      hostname === 'localhost' ||
      hostname.startsWith('127.')
    ) {
      this.testVersion = true
    }else{
      this.testVersion = false;
    }
    this.loginForm = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      appType: new FormControl('BO'),
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
            this.localstorage.setItem(storage_keys.STOREToken,res.access_token)
            this.localstorage.setItem(storage_keys.STOREUser,res.user)
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
