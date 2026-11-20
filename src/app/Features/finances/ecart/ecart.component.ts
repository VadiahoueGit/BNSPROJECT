import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ArticleServiceService} from "../../../core/article-service.service";
import {FinanceService} from "../../../core/finance.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {ALERT_QUESTION} from "../../shared-component/utils";
import { Status } from 'src/app/utils/utils';

interface EcartMotifGroup {
  motif: string;
  rows: any[];
  totalEcart: number;
}

interface EcartGroup {
  agentNom: string;
  role: string;
  motifGroups: EcartMotifGroup[];
  totalEcart: number;
  totalRows: number;
}

@Component({
  selector: 'app-ecart',
  templateUrl: './ecart.component.html',
  styleUrls: ['./ecart.component.scss']
})
export class EcartComponent {
  filters = { commande: '', agent: '', client: '', statut: '' };

  amountReal = 0;
  validatedPaiementForm!: FormGroup;
  isModalOpen = false;
  operation = '';
  updateData: any = {};
  selectedArticles: never[] = [];
  totalEmballage = 0;
  totalLiquide = 0;
  totalGlobal = 0;
  totalQte = 0;

  totalItems = 0;

  allGroups: EcartGroup[] = [];
  displayedGroups: EcartGroup[] = [];
  collapsedGroups = new Set<string>();
  collapsedMotifs = new Set<string>();

  currentPage = 1;
  groupsPerPage = 8;

  get totalPages(): number {
    return Math.ceil(this.allGroups.length / this.groupsPerPage);
  }

  constructor(
    private articleService: ArticleServiceService,
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.GetPaiementList();
  }

  filterGlobal() {
    this.GetPaiementList();
  }

  GetPaiementList() {
    const data = {
      page: 1,
      limit: 9999,
      numeroCommande: this.filters.commande || '',
      agent: this.filters.agent || '',
      clientNom: this.filters.client || '',
      statut: this.filters.statut || '',
    };
    this._spinner.show();
    this.financeService.GetCreanceList(data).then((res: any) => {
      this.totalItems = res.total;
      const rows = (res.data || []).map((row: any) => {
        // Sépare le libellé naturel du code de référence.
        // Un token est "code" si : ≥2 majuscules consécutives (RP-, EMB_…) OU commence par un chiffre.
        const motifMatch = (row.motif || '').match(/^(.+?)\s+([A-Z]{2}[A-Z0-9_\-].*|\d.*)$/);
        return {
          ...row,
          agentNom: row.encaisseurCommercial
            ? row.encaisseurCommercial.nom + ' ' + row.encaisseurCommercial.prenoms
            : row.encaisseurTransporteur
              ? row.encaisseurTransporteur.nom + ' ' + row.encaisseurTransporteur.prenoms
              : 'N/A',
          agentRole: row.encaisseurCommercial ? 'Commercial' : row.encaisseurTransporteur ? 'Transporteur' : 'N/A',
          motifGroupe: motifMatch ? motifMatch[1] : (row.motif || 'Sans motif'),
          motifRef:    motifMatch ? motifMatch[2] : null,
        };
      });
      this.buildGroups(rows);
      this._spinner.hide();
    }, () => this._spinner.hide());
  }

  private buildGroups(rows: any[]) {
    const agentMap = new Map<string, EcartGroup>();

    for (const row of rows) {
      const agentKey = row.agentNom.trim().toLowerCase();
      if (!agentMap.has(agentKey)) {
        agentMap.set(agentKey, { agentNom: row.agentNom.trim(), role: row.agentRole, motifGroups: [], totalEcart: 0, totalRows: 0 });
      }
      const g = agentMap.get(agentKey)!;

      const motifLabel = (row.motifGroupe || 'Sans motif').trim();
      const motifKey = motifLabel.toLowerCase();
      let mg = g.motifGroups.find(m => m.motif.toLowerCase() === motifKey);
      if (!mg) {
        mg = { motif: motifLabel, rows: [], totalEcart: 0 };
        g.motifGroups.push(mg);
      }
      mg.rows.push(row);
      mg.totalEcart += Number(row.montantEcart) || 0;
      g.totalEcart  += Number(row.montantEcart) || 0;
      g.totalRows++;
    }

    this.allGroups = Array.from(agentMap.values()).sort((a, b) => a.agentNom.localeCompare(b.agentNom));
    this.collapsedGroups = new Set(this.allGroups.map(g => g.agentNom.trim().toLowerCase()));
    this.collapsedMotifs = new Set();
    this.currentPage = 1;
    this.updateDisplay();
  }

  private updateDisplay() {
    const start = (this.currentPage - 1) * this.groupsPerPage;
    this.displayedGroups = this.allGroups.slice(start, start + this.groupsPerPage);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updateDisplay();
  }

  isAgentCollapsed(group: EcartGroup): boolean {
    return this.collapsedGroups.has(group.agentNom.trim().toLowerCase());
  }

  toggleGroup(agentNom: string) {
    const key = agentNom.trim().toLowerCase();
    if (this.collapsedGroups.has(key)) { this.collapsedGroups.delete(key); }
    else                                { this.collapsedGroups.add(key); }
  }

  isMotifCollapsed(agentNom: string, motif: string): boolean {
    return this.collapsedMotifs.has(agentNom.trim().toLowerCase() + '|' + motif.toLowerCase());
  }

  toggleMotif(agentNom: string, motif: string) {
    const key = agentNom.trim().toLowerCase() + '|' + motif.toLowerCase();
    if (this.collapsedMotifs.has(key)) { this.collapsedMotifs.delete(key); }
    else                               { this.collapsedMotifs.add(key); }
  }

  solderModalOpen = false;
  solderMotifGroup: EcartMotifGroup | null = null;
  solderAmount = 0;

  hasPositiveEcarts(mg: EcartMotifGroup): boolean {
    return mg.totalEcart > 0;
  }

  openSolderModal(mg: EcartMotifGroup) {
    if (mg.totalEcart <= 0) { this.toastr.info('Aucun écart net à percevoir pour ce motif.'); return; }
    this.solderMotifGroup = mg;
    this.solderAmount = mg.totalEcart;
    this.solderModalOpen = true;
  }

  closeSolderModal() {
    this.solderModalOpen = false;
    this.solderMotifGroup = null;
    this.solderAmount = 0;
  }

  async confirmerSoldage() {
    if (!this.solderMotifGroup || this.solderAmount <= 0) return;

    this._spinner.show();
    let remaining = this.solderAmount;
    let erreurs = 0;

    for (const row of this.solderMotifGroup.rows) {
      if (remaining <= 0) break;
      const rowDu = Number(row.montantEcart);
      if (rowDu <= 0) continue; // ignorer les écarts négatifs
      const toPay = Math.min(remaining, rowDu);
      try {
        const res: any = await this.financeService.ValidatePaiementEcart({ montant: toPay }, row.id);
        if (res?.statusCode === 200 || res?.statusCode === 201) {
          remaining -= toPay;
        } else {
          erreurs++;
        }
      } catch { erreurs++; }
    }

    this._spinner.hide();
    this.closeSolderModal();

    if (erreurs === 0) {
      this.toastr.success(remaining > 0
        ? `Paiement partiel — reste ${remaining.toLocaleString('fr-FR')} FCFA`
        : 'Motif soldé avec succès');
    } else {
      this.toastr.warning(`${erreurs} erreur(s) lors du soldage`);
    }
    this.GetPaiementList();
  }

  OnEdit(data: any) {
    this.updateData = data;
    this.isModalOpen = true;
    this.operation = 'edit';
  }

  OnCloseModal() {
    this.amountReal = 0;
    this.totalEmballage = 0;
    this.totalLiquide = 0;
    this.totalGlobal = 0;
    this.totalQte = 0;
    this.isModalOpen = false;
    this.selectedArticles = [];
  }

  ValidatePaiement() {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous valider ce paiement ?').then((res) => {
      if (!res.isConfirmed) return;
      this._spinner.show();
      this.financeService.ValidatePaiementEcart({ montant: this.amountReal }, this.updateData.id).then((res: any) => {
        this._spinner.hide();
        if (res.statusCode == 201 || res.statusCode == 200) {
          this.GetPaiementList();
          this.toastr.success(res.message);
          this.OnCloseModal();
        } else {
          this.toastr.error(res.message);
        }
      }, (err) => {
        this._spinner.hide();
        this.toastr.error(err.message);
      });
    });
  }

  protected readonly Status = Status;
}
