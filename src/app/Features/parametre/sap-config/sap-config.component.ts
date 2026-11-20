import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SapService } from 'src/app/core/sap.service';

@Component({
  selector: 'app-sap-config',
  templateUrl: './sap-config.component.html',
  styleUrls: ['./sap-config.component.scss'],
})
export class SapConfigComponent implements OnInit {
  form!: FormGroup;
  currentConfig: any = null;

  testingConnexion = false;
  connexionResult: { success: boolean; message: string } | null = null;

  runningNow = false;

  syncLog: any[] = [];
  syncLogTotal = 0;
  syncLogPage = 1;
  syncLogPageSize = 10;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private location: Location,
    private router: Router,
    private sapService: SapService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      sapEnabled: [false],
      baseUrl: [''],
      companyDB: [''],
      username: [''],
      password: [''],
    });
    this.loadConfig();
    this.loadSyncLog(1);
  }

  loadConfig() {
    this.spinner.show();
    this.sapService.getConfig().then(
      (res: any) => {
        this.currentConfig = res;
        this.form.patchValue(res);
        this.spinner.hide();
      },
      () => this.spinner.hide(),
    );
  }

  onSubmit() {
    this.spinner.show();
    this.sapService.updateConfig(this.form.value).then(
      () => {
        this.toastr.success('Configuration SAP enregistrée avec succès.');
        this.loadConfig();
        this.spinner.hide();
      },
      (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Erreur lors de la sauvegarde.');
      },
    );
  }

  testerConnexion() {
    this.testingConnexion = true;
    this.connexionResult = null;
    this.sapService.testConnexion(this.form.value).then(
      (res: any) => {
        this.connexionResult = res;
        this.testingConnexion = false;
        if (res.success) this.toastr.success(res.message);
        else this.toastr.error(res.message);
      },
      (err: any) => {
        this.testingConnexion = false;
        this.connexionResult = { success: false, message: err?.error?.message || 'Erreur lors du test de connexion.' };
        this.toastr.error(this.connexionResult.message);
      },
    );
  }

  lancerMaintenant() {
    this.runningNow = true;
    this.sapService.runNow().then(
      (res: any) => {
        this.runningNow = false;
        const log = res.data;
        if (log.statut === 'SUCCES') this.toastr.success('Extraction SAP terminée avec succès.');
        else this.toastr.error(`Extraction SAP échouée : ${log.erreur}`);
        this.loadConfig();
        this.loadSyncLog(1);
      },
      (err: any) => {
        this.runningNow = false;
        this.toastr.error(err?.error?.message || "Erreur lors du lancement de l'extraction.");
      },
    );
  }

  loadSyncLog(page: number) {
    this.sapService.getSyncLog(page, this.syncLogPageSize).then((res: any) => {
      this.syncLog = res.data || [];
      this.syncLogTotal = res.total || 0;
      this.syncLogPage = page;
    });
  }

  onSyncLogPage(event: any) {
    const page = event.first / event.rows + 1;
    this.syncLogPageSize = event.rows;
    this.loadSyncLog(page);
  }

  goToRapprochement() {
    this.router.navigate(['feature/finances/sap-rapprochement']);
  }

  goBack() {
    this.location.back();
  }
}
