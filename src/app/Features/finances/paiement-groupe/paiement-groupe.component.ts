import {Component} from '@angular/core';
import {ArticleServiceService} from "../../../core/article-service.service";
import {FinanceService} from "../../../core/finance.service";
import {NgxSpinnerService} from "ngx-spinner";
import {FormBuilder} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {calculeDateEcheance} from "../../../utils/utils";

@Component({
  selector: 'app-paiement-groupe',
  templateUrl: './paiement-groupe.component.html',
  styleUrls: ['./paiement-groupe.component.scss']
})
export class PaiementGroupeComponent {
  totalPages: any = [];
  dataList: any = [];
  currentPage: number
  rowsPerPage: number
  amountReal: number = 0
  isModalOpen = false;
  operation: string = '';
  updateData: any = {};
  isEditMode: boolean = false;
  soldePairMoyen: { libelle: string; montantAttendu: number; montantRecu: number | null; paiementIds: number[] }[] = [];
  dateDebutModal: string = '';
  dateFinModal: string = '';
  constructor(
    private articleService: ArticleServiceService,
    private financeService: FinanceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.GetPaiementAgentList(1)
  }
  OnEdit(data: any) {
    this.isEditMode = true;
    this.updateData = data;
    this.updateData.transactions = this.updateData.transactions.filter((transaction: any) =>
      transaction.paiements.some((paiement: any) => paiement.statut === 'En attente')
    );
    this.soldePairMoyen = this.buildSoldeParMoyen(this.updateData.transactions);
    this.amountReal = this.soldePairMoyen.reduce((s, m) => s + (m.montantRecu || 0), 0);
    this.isModalOpen = true;
    this.operation = 'edit';
  }
  OnCloseModal() {
    this.isModalOpen = false;
    this.dateDebutModal = '';
    this.dateFinModal = '';
  }

  get filteredTransactions(): any[] {
    if (!this.updateData?.transactions) return [];
    const debut = this.dateDebutModal ? new Date(this.dateDebutModal).setHours(0, 0, 0, 0) : null;
    const fin = this.dateFinModal ? new Date(this.dateFinModal).setHours(23, 59, 59, 999) : null;
    if (!debut && !fin) return this.updateData.transactions;
    return this.updateData.transactions.filter((t: any) =>
      (t.paiements || []).some((p: any) => {
        const d = new Date(p.datePaiement).getTime();
        return (!debut || d >= debut) && (!fin || d <= fin);
      })
    );
  }

  onDateFilterChange() {
    this.soldePairMoyen = this.buildSoldeParMoyen(this.filteredTransactions);
    this.amountReal = this.soldePairMoyen.reduce((s, m) => s + (m.montantRecu || 0), 0);
  }
  buildSoldeParMoyen(transactions: any[]): { libelle: string; montantAttendu: number; montantRecu: number | null; paiementIds: number[] }[] {
    const map = new Map<string, { montant: number; ids: number[] }>();
    for (const t of transactions) {
      for (const p of (t.paiements || [])) {
        if (p.statut !== 'Payé') {
          const libelle = p.moyenPaiement?.libelle || 'Non défini';
          if (!map.has(libelle)) map.set(libelle, { montant: 0, ids: [] });
          const entry = map.get(libelle)!;
          entry.montant += (p.montant || 0);
          entry.ids.push(p.id);
        }
      }
    }
    return Array.from(map.entries()).map(([libelle, { montant, ids }]) => ({
      libelle,
      montantAttendu: montant,
      montantRecu: null,
      paiementIds: ids,
    }));
  }

  onMontantRecuChange() {
    this.amountReal = this.soldePairMoyen.reduce((s, m) => s + (m.montantRecu || 0), 0);
  }

  groupPaiements(paiements: any[]): any[] {
    const map = new Map<string, any>();
    for (const p of (paiements || [])) {
      const key = p.moyenPaiement?.libelle || 'N/A';
      if (map.has(key)) {
        map.get(key).montant += (p.montant || 0);
      } else {
        map.set(key, { ...p, montant: p.montant || 0 });
      }
    }
    return Array.from(map.values());
  }

  get totalAttendu(): number {
    return this.soldePairMoyen.reduce((s, m) => s + m.montantAttendu, 0);
  }

  get ecart(): number {
    return this.totalAttendu - this.amountReal;
  }

  calculerTotalPaiements(transactions: any[]): number {
    let total = 0;
    for (const transaction of transactions) {
      if (transaction.paiements && transaction.paiements.length > 0) {
        for (const paiement of transaction.paiements) {
          if (paiement.statut != 'Payé') { // ✅ seulement si payé
            total += paiement.montant || 0;
          }
        }
      }
    }
    return total;
  }

  GetPaiementAgentList(page: number, agent?: string) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      nomAgent: agent || ''
    };
    this._spinner.show();
    this.financeService.GetPaiementAgentList(data).then((res: any) => {
      console.log('ALL:::>', res);
      this.totalPages = res.total// nombre total d’enregistrements

      this.dataList = res.data
      // .filter((item: any) => Number(item.montantPercu) > 0 && item.statut !== "Validé"

      // );
      console.log('DATA:::>', this.dataList);
      this._spinner.hide();
    });
  }

  ValiderUnType(type: { libelle: string; montantAttendu: number; montantRecu: number | null; paiementIds: number[] }) {
    const data = {
      paiementIds: type.paiementIds,
      montantTotalRecu: type.montantRecu,
    };
    this._spinner.show();
    this.financeService.ValiderPaiementGroup(data).then((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success(`${type.libelle} soldé avec succès`);
        this.soldePairMoyen = this.soldePairMoyen.filter(m => m.libelle !== type.libelle);
        this.amountReal = this.soldePairMoyen.reduce((s, m) => s + (m.montantRecu || 0), 0);
        if (this.soldePairMoyen.length === 0) {
          this.OnCloseModal();
          this.GetPaiementAgentList(1);
        }
      } else {
        this.toastr.error(res.message);
      }
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetPaiementAgentList(this.currentPage)
  }
}
