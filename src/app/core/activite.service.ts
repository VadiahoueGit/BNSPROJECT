import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({
  providedIn: 'root'
})
export class ActiviteService {
  token:string;
  apiUrl: any;
  constructor(private localstorage:LocalStorageService,private _http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.apiUrl;
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }



  DeletePointDeVente(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/point-de-vente/${id}`,{headers})
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

  //TYPE VISITE
  CreateTypeVisite(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/type-visite`, data,{headers}).subscribe(
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

  GetTypeVisiteList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/type-visite?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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
  UpdateTypeVisite(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/type-visite/${id}`, data,{headers}).subscribe(
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

  DeleteTypeVisite(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/type-visite/${id}`,{headers})
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

  // VISITE
  CreateVisite(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/visites`, data,{headers}).subscribe(
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

  GetVisiteList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/visites?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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

  UpdateVisite(id: number, data: any) {

    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/visites/${id}`, data,{headers}).subscribe(
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

  DeleteVisite(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/visites/${id}`,{headers})
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


   // QUESTIONNAIRE
   CreateQuestion(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/question`, data,{headers}).subscribe(
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

  GetQuestionList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/question?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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

  UpdateQuestion(id: number, data: any) {

    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/question/${id}`, data,{headers}).subscribe(
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

  DeleteQuestion(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/question/${id}`,{headers})
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

  //LIVRAISON
  CreationRegroupement(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/regroupements`, data,{headers}).subscribe(
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

  GetRegroupementList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/regroupements?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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
  //FACTURES
  CreateVenteGlobal(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/ventes_global`, data,{headers}).subscribe(
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

  GetVenteGlobalList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/ventes_global?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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
  GetVenteGlobalFactures(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/ventes_global/factures?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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
  GetDetailGlobalFacturesById(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/ventes_global/factures/${id}`,{headers}
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
  DownloadGlobalFacturesById(id: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });

      this._http.get(`${this.apiUrl}/v1/ventes_global/factures/${id}/telecharger`, {
        headers,
        responseType: 'blob'
      }).subscribe(response => {
        try {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          // Ouvrir le PDF dans une nouvelle fenêtre
          const newTab = window.open(url);
          if (!newTab) {
            throw new Error('Le popup a été bloqué par le navigateur.');
          }

          // Nettoyer l’URL après un certain temps pour éviter les fuites mémoire
          setTimeout(() => window.URL.revokeObjectURL(url), 10000);

          resolve();
        } catch (err) {
          console.error('Erreur lors de l’ouverture du PDF :', err);
          reject(err);
        }
      }, error => {
        console.error('Erreur lors du téléchargement du PDF :', error);
        reject(error);
      });
    });
  }

  //GESTION DES RETOURS

  ValidateRetourPlein(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/retours-pleins/${id}/valider`,{headers}).subscribe(
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
  GetRetourList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/retours?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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

  GetRetourPleinList() {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/retours-pleins`,{headers}
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

  GetRegroupementPdf(numRegroupement: string, data: any[]) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      });
  
      this._http
        .post(
          `${this.apiUrl}/v1/regroupements/${numRegroupement}/pdf`, 
          data,
          { headers ,responseType: 'blob' }
        )
        .subscribe(response => {
          try {
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
  
            // Ouvrir le PDF dans une nouvelle fenêtre
            const newTab = window.open(url);
            if (!newTab) {
              throw new Error('Le popup a été bloqué par le navigateur.');
            }
  
            // Nettoyer l’URL après un certain temps pour éviter les fuites mémoire
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  
            resolve();
          } catch (err) {
            console.error('Erreur lors de l’ouverture du PDF :', err);
            reject(err);
          }
        }, error => {
          console.error('Erreur lors du téléchargement du PDF :', error);
          reject(error);
        });
    });
  }
  
  GetRegroupementEmballagePdf(idretour: string, data: any[]) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      });
  
      this._http
        .post(
          `${this.apiUrl}/v1/regroupements/retour/${idretour}/pdf`, 
          data,
          { headers ,responseType: 'blob' }
        )
        .subscribe(response => {
          try {
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
  
            // Ouvrir le PDF dans une nouvelle fenêtre
            const newTab = window.open(url);
            if (!newTab) {
              throw new Error('Le popup a été bloqué par le navigateur.');
            }
  
            // Nettoyer l’URL après un certain temps pour éviter les fuites mémoire
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  
            resolve();
          } catch (err) {
            console.error('Erreur lors de l’ouverture du PDF :', err);
            reject(err);
          }
        }, error => {
          console.error('Erreur lors du téléchargement du PDF :', error);
          reject(error);
        });
    });
  }
  
}
