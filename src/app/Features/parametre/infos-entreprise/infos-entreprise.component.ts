import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { ParametreService } from 'src/app/core/parametre.service';
import { ConfigService } from 'src/app/core/config-service.service';

@Component({
  selector: 'app-infos-entreprise',
  templateUrl: './infos-entreprise.component.html',
  styleUrls: ['./infos-entreprise.component.scss'],
})
export class InfosEntrepriseComponent implements OnInit {
  form!: FormGroup;
  logoPreview: string | null = null;
  logoFile: File | null = null;
  currentConfig: any = null;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private location: Location,
    private parametreService: ParametreService,
    private configService: ConfigService,
  ) {}

  getLogoUrl(logoPath: string): string {
    if (!logoPath) return '';
    if (logoPath.startsWith('http')) return logoPath;
    const base = (this.configService.docUrl || '').replace(/\/$/, '');
    return base + logoPath;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      slogan: [''],
      adresse: [''],
      telephone1: [''],
      telephone2: [''],
      email: ['', Validators.email],
      rc: [''],
      cc: [''],
      delaiEcheanceFournisseurJours: [14, [Validators.required, Validators.min(1)]],
    });
    this.loadConfig();
  }

  loadConfig() {
    this.spinner.show();
    this.parametreService.getEntrepriseConfig().then(
      (res: any) => {
        this.currentConfig = res;
        this.form.patchValue(res);
        if (res.logoPath) this.logoPreview = this.getLogoUrl(res.logoPath);
        this.spinner.hide();
      },
      () => this.spinner.hide()
    );
  }

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => { this.logoPreview = e.target?.result as string; };
      reader.readAsDataURL(this.logoFile);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.spinner.show();

    const save = () => this.parametreService.updateEntrepriseConfig(this.form.value).then(
      () => {
        this.toastr.success('Informations enregistrées avec succès.');
        this.loadConfig();
        this.spinner.hide();
      },
      (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Erreur lors de la sauvegarde.');
      }
    );

    if (this.logoFile) {
      this.parametreService.uploadEntrepriseLogo(this.logoFile).then(
        () => save(),
        (err: any) => {
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Erreur upload logo.');
        }
      );
    } else {
      save();
    }
  }

  goBack() { this.location.back(); }
}
