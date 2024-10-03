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

  async ToOtpVerify() {
    try {
      await this._auth.ToVerifyPassword(this.forgetData).then((res: any) => {
        console.log(res);
        if (res.statusCode == 200 || res.statusCode == 201) {
          this._router.navigate(['otp-screen']);
        }
      });
    } catch (error) {
      this.handleError(error);
    }
  }
  handleError(error: any) {
    if (error.status === 404) {
      console.log('Adresse non trouvée');
    } else if (error.status === 500) {
      console.log('Erreur interne du serveur');
    } else if (error.status === 401) {
      console.log('Utilisateur pas autorisé');
    } else {
      console.log('Une erreur est survenue');
    }
  }
}
