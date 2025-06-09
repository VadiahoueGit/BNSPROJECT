import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

 accessToken?:string;
  token:string;
  apiUrl: any;
  ws:any;
  constructor(private localstorage:LocalStorageService,private _http: HttpClient, private configService: ConfigService) {
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
          console.log(err);
          reject(err);
        }
      );
    });
  }

  GetCreditList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/credit?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
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
            console.log(err);
            reject(err);
          }
        );
    });
  }

  // COMPTABILITE
  GetPaiementListPaye(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/transactions/paye?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande}&agent=${data.agent}&clientNom=${data.clientNom}&statut=${data.statut}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

  GetPaiementListAttente(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/transactions/en-attente?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande}&agent=${data.agent}&clientNom=${data.clientNom}&statut=${data.statut}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }
  GetPaiementList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/transactions/validation?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande}&agent=${data.agent}&clientNom=${data.clientNom}&statut=${data.statut}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
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
          console.log(err);
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
          console.log(err);
          reject(err);
        }
      );
    });
   }
   ValidatePaiement(id: any){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/comptabilite/valider/transaction/${id}`,{headers}).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          console.log(err);
          reject(err);
        }
      );
    });
   }
  GetComptes(data:any){
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/mouvements-par-depot?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&nomDepot=${data.nomDepot}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }
  GetBrouillard(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/comptabilite/grouped-by-depot-user?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

   // GESTION DES PAIEMENT

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
            console.log(err);
            reject(err);
          }
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
          console.log(err);
          reject(err);
        }
      );
    });
  }

}
