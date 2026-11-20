import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { SapService } from 'src/app/core/sap.service';

type SapTab = 'clients' | 'ORDER' | 'DELIVERY' | 'RETURN' | 'INVOICE' | 'CREDIT_NOTE' | 'tarifs';

@Component({
  selector: 'app-sap-rapprochement',
  templateUrl: './sap-rapprochement.component.html',
  styleUrls: ['./sap-rapprochement.component.scss'],
})
export class SapRapprochementComponent implements OnInit {
  activeTab: SapTab = 'clients';
  search = '';

  dataList: any[] = [];
  total = 0;
  pageSize = 10;

  priceLists: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private sapService: SapService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.load(1);
    this.sapService.getPriceLists().then((res: any) => (this.priceLists = res.data || []));
  }

  setTab(tab: SapTab) {
    this.activeTab = tab;
    this.search = '';
    this.load(1);
  }

  isDocumentTab(): boolean {
    return ['ORDER', 'DELIVERY', 'RETURN', 'INVOICE', 'CREDIT_NOTE'].includes(this.activeTab);
  }

  load(page: number) {
    this.spinner.show();
    let promise: Promise<any>;
    if (this.activeTab === 'clients') {
      promise = this.sapService.getBusinessPartners(page, this.pageSize, this.search);
    } else if (this.activeTab === 'tarifs') {
      promise = this.sapService.getItems(page, this.pageSize, this.search);
    } else {
      promise = this.sapService.getDocuments(this.activeTab, page, this.pageSize, this.search);
    }
    promise.then(
      (res: any) => {
        this.dataList = res.data || [];
        this.total = res.total || 0;
        this.spinner.hide();
      },
      () => this.spinner.hide(),
    );
  }

  onPage(event: any) {
    const page = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.load(page);
  }

  onSearch() {
    this.load(1);
  }

  priceListName(no: number): string {
    return this.priceLists.find((p) => p.priceListNo === no)?.priceListName || `Liste ${no}`;
  }

  goBack() {
    this.location.back();
  }
}
