import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FinanceService } from '../../../core/finance.service';
import { Modification } from './journal-modifications.data';

interface ConfigJournal {
  destinataires: string[];
  expediteur?: string;
  envoiApresDeploiement: boolean;
  envoiMensuel: boolean;
  dernierEnvoi?: string;
}

@Component({
  selector: 'app-journal-modifications',
  templateUrl: './journal-modifications.component.html',
  styleUrls: ['./journal-modifications.component.scss'],
})
export class JournalModificationsComponent {
  // Les entrées viennent de l'API : c'est elle qui les envoie par mail, donc elle en est la
  // seule source. L'écran et les mails montrent ainsi exactement la même chose.
  modifications: Modification[] = [];

  perimetreOptions = ['Tous', 'API', 'Back-office', 'Mobile'];
  statutOptions = ['Tous', 'Déployé', 'En attente'];
  periodeOptions = ['Tout', 'Jour', 'Semaine', 'Mois'];
  typeOptions = ['Tous', 'Ajout', 'Correction', 'Amélioration'];

  selectedType = 'Tous';
  selectedPerimetre = 'Tous';
  selectedStatut = 'Tous';
  selectedPeriode = 'Tout';
  recherche = '';

  isModalOpen = false;
  selection: Modification | null = null;

  isEnvoiModalOpen = false;
  readonly expediteurParDefaut = 'support@xteam.ci';
  config: ConfigJournal = { destinataires: [], expediteur: this.expediteurParDefaut, envoiApresDeploiement: false, envoiMensuel: false };
  nouvelleAdresse = '';

  constructor(
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.GetJournal();
    this.GetConfiguration();
  }

  GetJournal() {
    this._spinner.show();
    this.financeService.GetJournalModifications().then(
      (res: any) => {
        this.modifications = res?.data || [];
        this._spinner.hide();
      },
      () => {
        this._spinner.hide();
        this.toastr.error('Impossible de charger le journal des modifications.');
      },
    );
  }

  GetConfiguration() {
    this.financeService.GetJournalConfiguration().then(
      (res: any) => {
        if (res?.data) this.config = { ...res.data, expediteur: res.data.expediteur || this.expediteurParDefaut };
      },
      () => { /* les réglages restent à leurs valeurs par défaut */ },
    );
  }

  // --- envois par mail ---

  OnOpenEnvoi() {
    this.isEnvoiModalOpen = true;
  }

  OnCloseEnvoi() {
    this.isEnvoiModalOpen = false;
    this.nouvelleAdresse = '';
  }

  ajouterAdresse() {
    const adresse = this.nouvelleAdresse.trim().toLowerCase();
    if (!adresse) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adresse)) {
      this.toastr.warning('Adresse e-mail invalide.');
      return;
    }
    if (this.config.destinataires.includes(adresse)) {
      this.toastr.warning('Cette adresse est déjà enregistrée.');
      return;
    }
    this.config.destinataires = [...this.config.destinataires, adresse];
    this.nouvelleAdresse = '';
    // Enregistré aussitôt : une adresse ajoutée est conservée même si l'écran est quitté
    this.enregistrerConfiguration();
  }

  retirerAdresse(adresse: string) {
    this.config.destinataires = this.config.destinataires.filter((a) => a !== adresse);
    this.enregistrerConfiguration();
  }

  enregistrerConfiguration() {
    this._spinner.show();
    this.financeService.SaveJournalConfiguration(this.config).then(
      (res: any) => {
        this._spinner.hide();
        if (res?.statusCode === 200) {
          this.config = res.data;
          this.toastr.success('Réglages enregistrés.');
        } else {
          this.toastr.error(res?.message || 'Erreur lors de l\'enregistrement.');
        }
      },
      () => {
        this._spinner.hide();
        this.toastr.error('Erreur lors de l\'enregistrement des réglages.');
      },
    );
  }

  envoyerMaintenant() {
    if (!this.config.destinataires.length) {
      this.toastr.warning('Ajoutez au moins un destinataire avant d\'envoyer.');
      return;
    }

    this._spinner.show();
    this.financeService.EnvoyerJournalParMail(this.selectedPeriode.toLowerCase()).then(
      (res: any) => {
        this._spinner.hide();
        if (res?.statusCode === 200) {
          this.toastr.success(res.message);
          this.GetConfiguration();
        } else {
          this.toastr.error(res?.message || 'Erreur lors de l\'envoi.');
        }
      },
      () => {
        this._spinner.hide();
        this.toastr.error('Erreur lors de l\'envoi du journal.');
      },
    );
  }

  // --- filtres et affichage ---

  get total(): number {
    return this.modificationsFiltrees.length;
  }

  get nbDeployees(): number {
    return this.modificationsFiltrees.filter((m) => m.statut === 'Déployé').length;
  }

  get nbEnAttente(): number {
    return this.modificationsFiltrees.filter((m) => m.statut !== 'Déployé').length;
  }

  // Début de la période retenue, au format AAAA-MM-JJ : jour en cours, semaine en cours (à partir
  // du lundi) ou mois en cours. Null quand aucune période n'est demandée.
  private debutPeriode(): string | null {
    const aujourdhui = new Date();

    if (this.selectedPeriode === 'Jour') return this.enDateIso(aujourdhui);

    if (this.selectedPeriode === 'Semaine') {
      const jour = aujourdhui.getDay(); // 0 = dimanche
      const reculJusquAuLundi = jour === 0 ? 6 : jour - 1;
      const lundi = new Date(aujourdhui);
      lundi.setDate(aujourdhui.getDate() - reculJusquAuLundi);
      return this.enDateIso(lundi);
    }

    if (this.selectedPeriode === 'Mois') {
      return this.enDateIso(new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1));
    }

    return null;
  }

  private enDateIso(date: Date): string {
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${mois}-${jour}`;
  }

  get modificationsFiltrees(): Modification[] {
    const terme = this.recherche.trim().toLowerCase();
    const debut = this.debutPeriode();

    return this.modifications.filter((m) => {
      if (this.selectedType !== 'Tous' && m.type !== this.selectedType) return false;
      if (this.selectedPerimetre !== 'Tous' && m.perimetre !== this.selectedPerimetre) return false;
      if (this.selectedStatut !== 'Tous' && m.statut !== this.selectedStatut) return false;
      if (debut && m.date < debut) return false;
      if (!terme) return true;

      const contenu = [m.titre, m.module, m.description, m.demande, m.perimetre, m.type]
        .concat(m.fichiers || [])
        .join(' ')
        .toLowerCase();
      return contenu.includes(terme);
    });
  }

  OnView(modification: Modification) {
    this.selection = modification;
    this.isModalOpen = true;
  }

  OnCloseModal() {
    this.isModalOpen = false;
    this.selection = null;
  }

  resetFiltres() {
    this.selectedType = 'Tous';
    this.selectedPerimetre = 'Tous';
    this.selectedStatut = 'Tous';
    this.selectedPeriode = 'Tout';
    this.recherche = '';
  }

  get hasFiltres(): boolean {
    return (
      this.selectedType !== 'Tous' ||
      this.selectedPerimetre !== 'Tous' ||
      this.selectedStatut !== 'Tous' ||
      this.selectedPeriode !== 'Tout' ||
      !!this.recherche
    );
  }
}
