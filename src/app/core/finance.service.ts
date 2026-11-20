import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';
import { Observable } from 'rxjs';
import {NgxSpinnerService} from "ngx-spinner";

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

 accessToken?:string;
  token:string;
  apiUrl: any;
  ws:any;
  constructor(private localstorage:LocalStorageService,private _http: HttpClient, private configService: ConfigService,private _spinner: NgxSpinnerService) {
    this.apiUrl = this.configService.apiUrl;
    this.ws = this.configService.wsUrl;
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }


   // CREDIT

   CreateCredit(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/credit`, data).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
  }

  GetCreditList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      let url = `${this.apiUrl}/v1/credit?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`;
      if (data.search) url += `&search=${encodeURIComponent(data.search)}`;
      if (data.clientType) url += `&clientType=${encodeURIComponent(data.clientType)}`;
      this._http
        .get(url)
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  UpdateCredit(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/credit/${id}`, data).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
  }

  DeleteCredit(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .delete(`${this.apiUrl}/v1/credit/${id}`)
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }
  BulkDeleteCredit(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .delete(`${this.apiUrl}/v1/bulk-credit/${id}`)
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  // COMPTABILITE
  GetPaiementListPaye(data: any) {
    return new Promise((resolve: any, reject: any) => {
      let url = `${this.apiUrl}/v1/comptabilite/transactions/paye?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande}&agent=${data.agent}&clientNom=${data.clientNom}&statut=${data.statut}`;
      if (data.dateDebut) url += `&dateDebut=${encodeURIComponent(data.dateDebut)}`;
      if (data.dateFin) url += `&dateFin=${encodeURIComponent(data.dateFin)}`;
      this._http
        .get(url)
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  GetSousCompte(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/sous-comptes?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&clientType=revendeur`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }
  GetConsigne(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/transactions/consigne?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande}&agent=${data.agent}&clientNom=${data.clientNom}&statut=${data.statut}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }
  GetPaiementListAttente(data: any) {
    return new Promise((resolve: any, reject: any) => {
      let url = `${this.apiUrl}/v1/comptabilite/transactions/en-attente?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande}&agent=${data.agent}&clientNom=${data.clientNom}&statut=${data.statut}`;
      if (data.dateDebut) url += `&dateDebut=${encodeURIComponent(data.dateDebut)}`;
      if (data.dateFin) url += `&dateFin=${encodeURIComponent(data.dateFin)}`;
      this._http
        .get(url)
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  GetPaiementListBO(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/transactions/en-attente?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande || ''}&agent=&clientNom=${data.clientNom || ''}&statut=${data.statut || ''}&canal=BO&motif=${data.motif || ''}&dateDebut=${data.dateDebut || ''}&dateFin=${data.dateFin || ''}`
        )
        .subscribe(
          (res: any) => { resolve(res); },
          (err) => { this._spinner.hide(); reject(err); }
        );
    });
  }

  PayerTransaction(id: number, data: any) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/paiement/${id}/paiement`, data, { headers }).subscribe(
        (res: any) => { resolve(res); },
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  GetCreanceList(data: any) {
    let url = `${this.apiUrl}/v1/comptabilite/ecart-paiement?page=${data.page}&limit=${data.limit}`;
    if (data.agent)          url += `&agent=${encodeURIComponent(data.agent)}`;
    if (data.statut)         url += `&statut=${encodeURIComponent(data.statut)}`;
    if (data.numeroCommande) url += `&numeroCommande=${encodeURIComponent(data.numeroCommande)}`;
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(url)
        .subscribe(
          (res: any) => { resolve(res); },
          (err) => { this._spinner.hide(); reject(err); }
        );
    });
  }

  GetPaiementList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/transactions/validation?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande}&agent=${data.agent}&clientNom=${data.clientNom}&statut=${data.statut}&dateDebut=${data.dateDebut || ''}&dateFin=${data.dateFin || ''}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  ValiderPaiementGroup(data: any){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/comptabilite/valider/transactions`,data,{headers}).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
  }
  GetPaiementAgentList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/transaction-par-agent?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&nomAgent=${data.nomAgent}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  GetRecouvrementList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      let url = `${this.apiUrl}/v1/comptabilite/recouvrement?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&agent=${data.agent || ''}`;
      if (data.dateDebut) url += `&dateDebut=${encodeURIComponent(data.dateDebut)}`;
      if (data.dateFin) url += `&dateFin=${encodeURIComponent(data.dateFin)}`;
      if (data.sens) url += `&sens=${encodeURIComponent(data.sens)}`;
      if (data.moyen) url += `&moyen=${encodeURIComponent(data.moyen)}`;
      if (data.depotId) url += `&depotId=${encodeURIComponent(data.depotId)}`;
      this._http
        .get(url)
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  GenererBLVenteChine(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/comptabilite/vente-chine/${id}/bon-livraison`, {}, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  GenererBLVente(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/comptabilite/vente/${id}/bon-livraison`, {}, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

   ApprouverVenteChine(id: any){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/comptabilite/approuver/commandechine/${id}`,{headers}).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
   }
   ApprouverCommandeClient(id: any){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/comptabilite/approuver/commandeclient/${id}`,{headers}).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
   }

   RejeterCommandeClient(id: any, motifRejet: string){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/commandes-client/rejeter/commandeclient/${id}`, { motifRejet }, { headers }).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          reject(err);
        }
      );
    });
   }

   ApprouverCommandeGratuite(id: any){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/comptabilite/approuver/commandegratuit/${id}`,{headers}).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
   }

  ValidatePaiementEcart(data: any,id:number){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/comptabilite/ecart-paiement/${id}/payer`,data,{headers}).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
  }

   ValidatePaiement(id: any, data: any = {}){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/comptabilite/valider/transaction/${id}`, data, { headers }).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
   }
  GetComptes(nomDepot = '') {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(`${this.apiUrl}/v1/comptabilite/mouvements-par-depot?nomDepot=${nomDepot}`)
        .subscribe({ next: (res: any) => resolve(res), error: (err) => { this._spinner.hide(); reject(err); } });
    });
  }

  GetPaiementsDepot(depotId: number, page = 1, limit = 50) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(`${this.apiUrl}/v1/comptabilite/mouvements-par-depot/${depotId}/paiements?page=${page}&limit=${limit}`)
        .subscribe({ next: (res: any) => resolve(res), error: (err) => { this._spinner.hide(); reject(err); } });
    });
  }
  GetBrouillard(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/grouped-by-depot-user?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&sens=${data.sens||''}&moyen=${encodeURIComponent(data.moyen||'')}&motif=${encodeURIComponent(data.motif||'')}&dateFrom=${data.dateFrom||''}&dateTo=${data.dateTo||''}&depotId=${data.depotId||''}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  SaveDepense(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/depenses`, data).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
  }

  AnnulerDepense(depenseId: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.delete(`${this.apiUrl}/v1/depenses/${depenseId}`, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }
   // GESTION DES PAIEMENT

  getRecuPaiement(transactionId: number): Promise<Blob> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
    return new Promise((resolve, reject) => {
      this._http.get(`${this.apiUrl}/v1/paiement/${transactionId}/recu`, { headers, responseType: 'blob' }).subscribe(
        (res: Blob) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  GetHistoriquePayment(id: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/paiement/${id}/historique-paiements`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  AnnulerPaiementTransaction(paiementId: number, motifAnnulation?: string) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .post(`${this.apiUrl}/v1/paiement/${paiementId}/annuler`, { motifAnnulation }, { headers })
        .subscribe(
          (res: any) => { resolve(res); },
          (err) => { this._spinner.hide(); reject(err); }
        );
    });
  }

  // --- Journal des modifications (écran Administration) ---

  GetJournalModifications() {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.get(`${this.apiUrl}/v1/journal`, { headers }).subscribe(
        (res: any) => { resolve(res); },
        (err) => { reject(err); }
      );
    });
  }

  GetJournalConfiguration() {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.get(`${this.apiUrl}/v1/journal/configuration`, { headers }).subscribe(
        (res: any) => { resolve(res); },
        (err) => { reject(err); }
      );
    });
  }

  SaveJournalConfiguration(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/journal/configuration`, data, { headers }).subscribe(
        (res: any) => { resolve(res); },
        (err) => { reject(err); }
      );
    });
  }

  EnvoyerJournalParMail(periode: string) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/journal/envoyer?periode=${periode}`, {}, { headers }).subscribe(
        (res: any) => { resolve(res); },
        (err) => { reject(err); }
      );
    });
  }

  AnnulerConsigne(transactionId: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .post(`${this.apiUrl}/v1/retours/consigne/${transactionId}/annuler`, {}, { headers })
        .subscribe(
          (res: any) => { resolve(res); },
          (err) => { this._spinner.hide(); reject(err); }
        );
    });
  }

  RevenirEnAttente(transactionId: number, motifAnnulation?: string) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .patch(`${this.apiUrl}/v1/paiement/${transactionId}/revenir-en-attente`, { motifAnnulation }, { headers })
        .subscribe(
          (res: any) => { resolve(res); },
          (err) => { this._spinner.hide(); reject(err); }
        );
    });
  }

  CreateMoyenPaiement(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/moyens-paiement`, data,{headers}).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
  }

  GetMoyenPaiementList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/moyens-paiement?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
        )
        .subscribe(
          (res: any) => {

            console.log(res);
            resolve(res);
          },
          (err) => {
            this._spinner.hide();
            console.log(err);
            reject(err);
          }
        );
    });
  }

  UpdateMoyenPaiement(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/moyens-paiement/${id}`, data,{headers}).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          this._spinner.hide();
          console.log(err);
          reject(err);
        }
      );
    });
  }

  // ===== Banques =====
  CreateBanque(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/banques`, data, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  GetBanqueList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .get(
          `${this.apiUrl}/v1/banques?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}${data.search ? '&search=' + encodeURIComponent(data.search) : ''}`,
          { headers }
        )
        .subscribe(
          (res: any) => resolve(res),
          (err) => { this._spinner.hide(); reject(err); }
        );
    });
  }

  UpdateBanque(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.put(`${this.apiUrl}/v1/banques/${id}`, data, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  DeleteBanque(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.delete(`${this.apiUrl}/v1/banques/${id}`, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  // ===== Comptes =====
  CreateCompte(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/comptes`, data, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  GetCompteList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .get(
          `${this.apiUrl}/v1/comptes?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}${data.search ? '&search=' + encodeURIComponent(data.search) : ''}`,
          { headers }
        )
        .subscribe(
          (res: any) => resolve(res),
          (err) => { this._spinner.hide(); reject(err); }
        );
    });
  }

  UpdateCompte(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.put(`${this.apiUrl}/v1/comptes/${id}`, data, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  DeleteCompte(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.delete(`${this.apiUrl}/v1/comptes/${id}`, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  // ===== Types de compte =====
  CreateTypeCompte(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/type-comptes`, data, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  GetTypeCompteList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .get(
          `${this.apiUrl}/v1/type-comptes?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}${data.search ? '&search=' + encodeURIComponent(data.search) : ''}`,
          { headers }
        )
        .subscribe(
          (res: any) => resolve(res),
          (err) => { this._spinner.hide(); reject(err); }
        );
    });
  }

  UpdateTypeCompte(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.put(`${this.apiUrl}/v1/type-comptes/${id}`, data, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

  DeleteTypeCompte(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.delete(`${this.apiUrl}/v1/type-comptes/${id}`, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => { this._spinner.hide(); reject(err); }
      );
    });
  }

}
