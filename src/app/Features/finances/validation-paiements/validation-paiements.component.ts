import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {ALERT_QUESTION, ALERT_INFO} from '../../shared-component/utils';
import * as Swal from 'sweetalert2';
import {FinanceService} from '../../../core/finance.service';
import {calculeDateEcheance, Status} from "../../../utils/utils";

@Component({
  selector: 'app-validation-paiements',
  templateUrl: './validation-paiements.component.html',
  styleUrls: ['./validation-paiements.component.scss'],
})
export class ValidationPaiementsComponent {
  @ViewChild('dt2') dt2!: Table;
  filters = {
    commande: '',
    agent: '',
    client: '',
    statut: '',
    dateDebut: '',
    dateFin: ''
  };
  statuses!: any[];
  dataList!: any[];
  validatedPaiementForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  ListCLients: any = [];
  hstoriquePayment: any = [];
  currentPage: number;
  rowsPerPage: any;
  totalEmballage: number;
  totalLiquide: number;
  totalGlobal: number;
  totalQte: number;
  selectedArticles: never[];
  totalPages: number;

  constructor(
    private articleService: ArticleServiceService,
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.GetPaiementList(1);
  }

  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }
  get filteredArticles() {
    return this.updateData.returnStock?.ventesReturn?.filter((a:any) => a.prixUnitaire > 0);
  }
  OnEdit(data: any) {
    this.GetHistoriquePayment(data.id)
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.updateData.dateEchanceCalculer = calculeDateEcheance(
      data?.createdAt,
      data?.credit?.delaiReglement
    );
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }

  filterGlobal() {
    this.GetPaiementList(
      1,
      this.filters.commande,
      this.filters.agent,
      this.filters.client,
      this.filters.statut,
      this.filters.dateDebut,
      this.filters.dateFin
    );
  }

  GetPaiementList(page: number, numeroCommande?: string, agent?: string, clientNom?: string, statut?: string, dateDebut?: string, dateFin?: string) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      numeroCommande: numeroCommande || '',
      agent: agent || '',
      clientNom: clientNom || '',
      statut: statut || '',
      dateDebut: dateDebut || '',
      dateFin: dateFin || ''
    };
    this._spinner.show();
    this.financeService.GetPaiementList(data).then((res: any) => {
      console.log('ALL:::>', res);
      this.totalPages = res.total// nombre total d’enregistrements

      this.dataList = res.data
      // .filter((item: any) => Number(item.montantPercu) > 0 && item.statut !== "Validé"

      // );
      console.log('DATA:::>', this.dataList);
      this._spinner.hide();
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetPaiementList(this.currentPage)
  }

  loadArticleDetails(): void {
    this.validatedPaiementForm.patchValue({
      photo: this.updateData.photo ?? '',
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      Conditionnement: this.updateData.Conditionnement,
      categorieId: this.updateData.categorieproduit.id,
      groupeId: this.updateData.groupearticle.id,
      plastiquenuId: this.updateData.plastiquenu.id,
      bouteillevideId: this.updateData.bouteillevide.id,
      liquideId: 1,
    });
  }

  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }

  OnCloseModal() {
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isModalOpen = false;
    this.selectedArticles = [];
    console.log(this.isModalOpen);
  }

  ValidatePaiement(data: any) {
    const libelleMoyen = data?.moyenPaiement?.libelle;
    const necessiteBanqueCheque = libelleMoyen === 'Banque' || libelleMoyen === 'Chèque';
    const montantDeclare = Number(data?.montant || 0);
    const montantValideInput = `<input id="swal-montant-valide" type="number" class="swal2-input" placeholder="Montant validé" value="${montantDeclare}">`;

    if (necessiteBanqueCheque) {
      (Swal as any).default.fire({
        icon: 'warning',
        title: `Paiement par ${libelleMoyen}`,
        html:
          `<input id="swal-banque" class="swal2-input" placeholder="Nom de la banque">` +
          `<input id="swal-numero-cheque" class="swal2-input" placeholder="Numéro de chèque (alphanumérique)">` +
          montantValideInput,
        showCancelButton: true,
        confirmButtonText: 'Valider',
        cancelButtonText: 'Annuler',
        confirmButtonColor: 'var(--primary-color)',
        heightAuto: false,
        preConfirm: () => {
          const banque = (document.getElementById('swal-banque') as HTMLInputElement)?.value?.trim();
          const numeroCheque = (document.getElementById('swal-numero-cheque') as HTMLInputElement)?.value?.trim();
          const montantValideStr = (document.getElementById('swal-montant-valide') as HTMLInputElement)?.value?.trim();
          if (!banque || !numeroCheque) {
            (Swal as any).default.showValidationMessage('Le nom de la banque et le numéro de chèque sont obligatoires.');
            return false;
          }
          if (!/^[a-zA-Z0-9]+$/.test(numeroCheque)) {
            (Swal as any).default.showValidationMessage('Le numéro de chèque doit être alphanumérique.');
            return false;
          }
          if (montantValideStr === '' || isNaN(Number(montantValideStr)) || Number(montantValideStr) < 0) {
            (Swal as any).default.showValidationMessage('Le montant validé est obligatoire et doit être positif.');
            return false;
          }
          return { banque, numeroCheque, montantValide: Number(montantValideStr) };
        },
      }).then((res: any) => {
        if (res.isConfirmed) {
          this.confirmerEcartPuisValider(data, montantDeclare, res.value);
        }
      });
      return;
    }

    (Swal as any).default.fire({
      icon: 'warning',
      title: 'Valider ce paiement ?',
      html: montantValideInput,
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: 'var(--primary-color)',
      heightAuto: false,
      preConfirm: () => {
        const montantValideStr = (document.getElementById('swal-montant-valide') as HTMLInputElement)?.value?.trim();
        if (montantValideStr === '' || isNaN(Number(montantValideStr)) || Number(montantValideStr) < 0) {
          (Swal as any).default.showValidationMessage('Le montant validé est obligatoire et doit être positif.');
          return false;
        }
        return { montantValide: Number(montantValideStr) };
      },
    }).then((res: any) => {
      if (res.isConfirmed) {
        this.confirmerEcartPuisValider(data, montantDeclare, res.value);
      }
    });
  }

  // Double facteur de vérification en cas d'écart (même schéma que Retour Plein) : une popup
  // d'information bloquante suivie d'une confirmation Oui/Non, avant d'envoyer la validation.
  private confirmerEcartPuisValider(data: any, montantDeclare: number, extra: { banque?: string; numeroCheque?: string; montantValide: number }) {
    const ecart = montantDeclare - extra.montantValide;
    const proceed = () => {
      ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous valider ce paiement?').then((res) => {
        if (res.isConfirmed == true) {
          this.doValidatePaiement(data, extra);
        }
      });
    };
    if (ecart !== 0) {
      ALERT_INFO(
        'info',
        'Écart détecté',
        `Montant déclaré : ${montantDeclare.toLocaleString()} FCFA. Montant validé : ${extra.montantValide.toLocaleString()} FCFA. Écart : ${Math.abs(ecart).toLocaleString()} FCFA.`
      ).then(() => proceed());
    } else {
      proceed();
    }
  }

  private doValidatePaiement(data: any, extra: { banque?: string; numeroCheque?: string; montantValide?: number }) {
    this._spinner.show();
    this.financeService.ValidatePaiement(data.id, extra).then((res: any) => {
      if (res.statusCode == 200) {
        this.GetPaiementList(1);
        const match = this.dataList.find(item => item.id === this.updateData.id);
        this.OnEdit(match);
        this.toastr.success(res.message);
      } else {
        this.toastr.error(res.message);
      }
      this._spinner.hide();
    });
  }

  GetHistoriquePayment(id: number) {
    this._spinner.show();
    this.financeService.GetHistoriquePayment(id).then((res: any) => {
      this.hstoriquePayment = res.data
      console.log('data:::>', res);
      this._spinner.hide();
    });
  }

  downloadRecu(row: any) {
    this.financeService.getRecuPaiement(row.id).then((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-${row.numTransaction || row.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }).catch(() => this.toastr.error('Erreur lors du téléchargement du reçu'));
  }

  protected readonly Status = Status;
}
