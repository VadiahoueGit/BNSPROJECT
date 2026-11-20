import { Component } from '@angular/core';
import {FinanceService} from "../../../core/finance.service";
import {CoreServiceService} from "../../../core/core-service.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.scss']
})
export class ComptesComponent {
  filters = { depot: '' };
  depotList: any[] = [];
  filterDepotId: number | null = null;
  isModalOpen = false;
  selectedDepotNom = '';
  selectedDepotId  = 0;
  dataList: any[] = [];
  updateData: any[] = [];

  totalVentes   = 0;
  totalEncaisse = 0;
  totalCreances = 0;

  constructor(
    private financeService: FinanceService,
    private coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.GetComptes();
    this.GetDepotList();
  }

  GetDepotList() {
    this.coreService.GetDepotList({ paginate: false, page: 1, limit: 100 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  onDepotFilterChange() {
    const depot = this.depotList.find((d) => d.id === this.filterDepotId);
    this.filters.depot = depot ? depot.nomDepot : '';
    this.GetComptes();
  }

  OnCloseModal() { this.isModalOpen = false; }

  GetComptes() {
    this._spinner.show();
    this.financeService.GetComptes(this.filters.depot || '').then((res: any) => {
      this.dataList = res.data || [];
      this.computeTotaux();
      this._spinner.hide();
    }, () => this._spinner.hide());
  }

  computeTotaux() {
    this.totalEncaisse = this.dataList.reduce((s, d) => s + Number(d.montantPercuTotal      || 0), 0);
    this.totalCreances = this.dataList.reduce((s, d) => s + Number(d.montantAPercevoirTotal || 0), 0);
    this.totalVentes   = this.totalEncaisse + this.totalCreances;
  }

  getProgressPct(depot: any): number {
    const total = Number(depot.montantPercuTotal || 0) + Number(depot.montantAPercevoirTotal || 0);
    if (!total) return 0;
    return Math.min(100, Math.round((Number(depot.montantPercuTotal || 0) / total) * 100));
  }

  modalTotal = 0;
  modalPage  = 1;
  readonly modalLimit = 50;

  OnViewDetail(depot: any) {
    this.isModalOpen      = true;
    this.selectedDepotNom = depot.nomDepot;
    this.selectedDepotId  = depot.depotId;
    this.updateData       = [];
    this.modalPage        = 1;
    this.loadModalPage(1);
  }

  loadModalPage(page: number) {
    this._spinner.show();
    this.financeService.GetPaiementsDepot(this.selectedDepotId, page, this.modalLimit).then((res: any) => {
      this.updateData = res.data || [];
      this.modalTotal = res.total || 0;
      this.modalPage  = page;
      this._spinner.hide();
    }, () => this._spinner.hide());
  }

  onModalPage(event: any) {
    const page = event.first / event.rows + 1;
    this.loadModalPage(page);
  }
}
