import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { LocalStorageService } from 'src/app/core/local-storage.service';
import { storage_keys } from 'src/app/Features/shared-component/utils';
import { SplashService } from '../../../core/splash.service';
import { ConfigService } from 'src/app/core/config-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  isLoading: Boolean = false;
  submitError: Boolean = false;
  testVersion: boolean = false;
  showCompanyModal: boolean = false;
  isSwitching: boolean = false;
  loadingCompanies: boolean = false;
  companies: { tenantId: string; nom: string; logoPath: string }[] = [];

  showDepotHoteModal: boolean = false;
  isCreatingDepot: boolean = false;
  depotHoteForm = new FormGroup({
    nomDepot:  new FormControl('', [Validators.required]),
    gerant:    new FormControl('', [Validators.required]),
    telephone: new FormControl('', [Validators.required]),
  });
  constructor(
    private _router: Router,
    public splashService: SplashService,
    private localstorage: LocalStorageService,
    private _auth: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private configService: ConfigService,
  ) {}

  getLogoUrl(logoPath: string): string {
    if (!logoPath) return '';
    if (logoPath.startsWith('http')) return logoPath;
    const base = (this.configService.docUrl || '').replace(/\/$/, '');
    return base + logoPath;
  }
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
          this.isLoading = false;
          if (res.access_token) {
            this.localstorage.setItem(storage_keys.STOREToken, res.access_token);
            this.localstorage.setItem(storage_keys.STOREUser, res.user);
            this.localstorage.setItem(storage_keys.STORETenant, res.user?.tenantId ?? 'db1');
            const roleName = res.user?.role?.name || res.user?.role || '';
            if (roleName === 'Super admin') {
              this.loadingCompanies = true;
              this.showCompanyModal = true;
              this._auth.getCompanies().then((list: any[]) => {
                this.companies = list;
                this.loadingCompanies = false;
              }).catch(() => { this.loadingCompanies = false; });
            } else {
              this.splashService.show = true;
              this._router.navigate(['feature']);
            }
          }
        });
      } catch (error) {
        this.isLoading = false;
        this.handleError(error);
      }
    }
  }

  async selectCompany(tenantId: string) {
    this.isSwitching = true;
    try {
      const res: any = await this._auth.switchCompany(tenantId);
      this.localstorage.setItem(storage_keys.STOREToken, res.access_token);
      this.localstorage.setItem(storage_keys.STORETenant, res.tenantId);
      const hasDepots = await this._auth.checkHasDepots();
      if (!hasDepots) {
        this.isSwitching = false;
        this.showCompanyModal = false;
        this.showDepotHoteModal = true;
      } else {
        window.location.href = '/feature';
      }
    } catch (error) {
      this.isSwitching = false;
    }
  }

  async submitDepotHote() {
    if (this.depotHoteForm.invalid) return;
    this.isCreatingDepot = true;
    try {
      await this._auth.createDepotHote(this.depotHoteForm.value as any);
      window.location.href = '/feature';
    } catch (error) {
      this.isCreatingDepot = false;
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
