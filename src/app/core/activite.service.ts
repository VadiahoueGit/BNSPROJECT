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

  UpdateVisiteProgrammation(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/visites/planification/${id}`, data,{headers}).subscribe(
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
  GetVisiteProgrammationList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/visites/planification/visite/commercial?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&dateDebut=${data.dateDebut}&dateFin=${data.dateFin}&commercialNomPrenom=${data.commercialNomPrenom}`,{headers}
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

  DeletePlanification(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/visites/planification/${id}`,{headers})
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
  AjouterCommandesRegroupement(id: number, commandes: string[]) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.patch(`${this.apiUrl}/v1/regroupements/${id}/ajouter-commandes`, { commandes }, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err)
      );
    });
  }

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
          `${this.apiUrl}/v1/regroupements?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&statut=${data.statut || ''}&dateDebut=${data.dateDebut || ''}&dateFin=${data.dateFin || ''}&numero=${encodeURIComponent(data.numero || '')}&conducteur=${encodeURIComponent(data.conducteur || '')}&depotId=${data.depotId || ''}&_t=${Date.now()}`,{headers}
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

  AnnulerRegroupement(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.patch(`${this.apiUrl}/v1/regroupements/${id}/annuler`, {}, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  GetRegroupementByCommandeId(commandeId: number, type?: string) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.get(`${this.apiUrl}/v1/regroupements/by-commande/${commandeId}${type ? '?type=' + type : ''}`, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  GetRegroupementById(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.get(`${this.apiUrl}/v1/regroupements/${id}`, { headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  //FACTURES
  CreateVenteGlobal(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/ventes_global/vente-avec-retour`, data,{headers}).subscribe(
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

  GetVenteInfo(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/ventes/${data}`,{headers}
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

  AnnulerVente(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.delete(`${this.apiUrl}/v1/ventes_global/annuler/${data}`,{headers}).subscribe(
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

  GetVenteInterchangeList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/interchanges/retours?returnStockId=${data.returnStockId}&paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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
          `${this.apiUrl}/v1/facture/factures?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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
  //VENTE AU DEPOT
  CreateLivraison(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/livraisons`, data, { headers }).subscribe({
        next: (res: any) => resolve(res),
        error: (err) => reject(err)
      });
    });
  }

  LivrerAvecRetour(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/livraisons/livrer-avec-retour`, data, {headers}).subscribe(
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

  LivrerCommande(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/livraisons/livrer`, data, { headers }).subscribe({
        next: (res: any) => resolve(res),
        error: (err) => reject(err)
      });
    });
  }

  GetDetailGlobalFacturesById(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/facture/factures/${id}`,{headers}
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

      this._http.get(`${this.apiUrl}/v1/facture/factures/${id}/telecharger`, {
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

  DownloadGlobalProformaById(id: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });

      this._http.get(`${this.apiUrl}/v1/facture/factures-proforma/${id}/telecharger`, {
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

  ValidateRetourPlein(id: any,data :any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/retours-pleins/${id}/valider`,data,{headers}).subscribe(
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
  AnnulerValidationRetourPlein(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/retours-pleins/${id}/annuler-validation`, {}, {headers}).subscribe(
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
  ValidateRetourById(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/retours/valider/${id}`,{headers}).subscribe(
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

  RetourEmballageManual(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/retours`,data,{headers}).subscribe(
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

  GetRetourEmballageList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      const filterParams =
        `&statut=${encodeURIComponent(data.statut || '')}` +
        `&numCommande=${encodeURIComponent(data.numCommande || '')}` +
        `&dateDebut=${data.dateDebut || ''}` +
        `&dateFin=${data.dateFin || ''}`;
      this._http
        .get(
          `${this.apiUrl}/v1/retours/emballages?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}${filterParams}`,{headers}
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

  GetHistoriqueRetourEmballage(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .get(`${this.apiUrl}/v1/retours/emballages/${id}/historique`, { headers })
        .subscribe(
          (res: any) => resolve(res),
          (err) => reject(err)
        );
    });
  }

  AnnulerRetourEmballage(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .put(`${this.apiUrl}/v1/retours/emballages/${id}/annuler`, {}, { headers })
        .subscribe(
          (res: any) => resolve(res),
          (err) => reject(err)
        );
    });
  }

  GetRetourList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      const filterParams =
        `&numeroCommande=${encodeURIComponent(data.numeroCommande || '')}` +
        `&agent=${encodeURIComponent(data.agent || '')}` +
        `&client=${encodeURIComponent(data.client || '')}` +
        `&depotId=${data.depotId || ''}` +
        `&dateDebut=${data.dateDebut || ''}` +
        `&dateFin=${data.dateFin || ''}`;
      this._http
        .get(
          `${this.apiUrl}/v1/retours/rdv?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}${filterParams}`,{headers}
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

  GetEmballagesRecuperesDepuisRdv(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/retours/rdv/recuperes?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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

  TerminerInventaire(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/return-article-inventories`,data,{headers}).subscribe(
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
  CreateRdvManuel(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/retours/rdv/manuel`, data, { headers }).subscribe(
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
  AnnulerRdvManuel(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/retours/rdv/manuel/${id}/annuler`, {}, { headers }).subscribe(
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
  AnnulerInventaire(regroupementId: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/return-article-inventories/regroupement/${regroupementId}/annuler`,{},{headers}).subscribe(
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
  TerminerRegroupement(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/retours/terminer-regroupement-emballage/${id}`,{headers}).subscribe(
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

  GetRetourWithArtilesListAgent(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/retours/emballage/regroupement?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}${data.statut ? '&statut=' + encodeURIComponent(data.statut) : ''}${data.dateDebut ? '&dateDebut=' + data.dateDebut : ''}${data.dateFin ? '&dateFin=' + data.dateFin : ''}${data.numero ? '&numero=' + encodeURIComponent(data.numero) : ''}${data.agent ? '&agent=' + encodeURIComponent(data.agent) : ''}${data.contact ? '&contact=' + encodeURIComponent(data.contact) : ''}${data.fonction ? '&fonction=' + encodeURIComponent(data.fonction) : ''}${data.depotId ? '&depotId=' + data.depotId : ''}${data.dateInventaire ? '&dateInventaire=' + data.dateInventaire : ''}`,{headers}
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

  GetGroupDetail(regroupementId: number | null, transporteurId: number | null, commercialId: number | null) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.get(
        `${this.apiUrl}/v1/retours/emballage/regroupement/detail?regroupementId=${regroupementId}&transporteurId=${transporteurId}&commercialId=${commercialId}`,
        { headers }
      ).subscribe((res: any) => resolve(res), (err: any) => reject(err));
    });
  }

  GetRetourPleinRegroupementList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .get(
          `${this.apiUrl}/v1/retours-pleins/regroupement?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}${data.statut ? '&statut=' + encodeURIComponent(data.statut) : ''}${data.dateDebut ? '&dateDebut=' + data.dateDebut : ''}${data.dateFin ? '&dateFin=' + data.dateFin : ''}${data.numero ? '&numero=' + encodeURIComponent(data.numero) : ''}${data.agent ? '&agent=' + encodeURIComponent(data.agent) : ''}${data.depotId ? '&depotId=' + data.depotId : ''}`,
          { headers }
        )
        .subscribe((res: any) => resolve(res), (err: any) => reject(err));
    });
  }

  GetGroupDetailRetourPlein(regroupementId: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.get(
        `${this.apiUrl}/v1/retours-pleins/regroupement/detail?regroupementId=${regroupementId}`,
        { headers }
      ).subscribe((res: any) => resolve(res), (err: any) => reject(err));
    });
  }

  TerminerRegroupementRetourPlein(id: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.patch(`${this.apiUrl}/v1/retours-pleins/terminer-regroupement/${id}`, {}, { headers })
        .subscribe((res: any) => resolve(res), (err: any) => reject(err));
    });
  }

  CreateInventaireRetourPlein(regroupementId: any, inventories: any[]) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/retours-pleins/inventaire`, { regroupementId, inventories }, { headers })
        .subscribe((res: any) => resolve(res), (err: any) => reject(err));
    });
  }

  AnnulerInventaireRetourPlein(regroupementId: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/retours-pleins/inventaire/${regroupementId}/annuler`, {}, { headers })
        .subscribe((res: any) => resolve(res), (err: any) => reject(err));
    });
  }

  GetRetourWithArtilesListAgentPdf(data: any,result:any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      });

      this._http
        .post(
          `${this.apiUrl}/v1/regroupements/regroupe/regroupement_emballage/pdf?regroupementId=${data.regroupementId}&transporteurId=${data.transporteurId}&role=${data.role}`,
          result,
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

  GetRetourWithArtilesListAgentExcel(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });

      this._http
        .get(
          `${this.apiUrl}/v1/regroupements/regroupe/regroupement_emballage/excel?regroupementId=${data.regroupementId}&transporteurId=${data.transporteurId}&role=${data.role}`,
          { headers, responseType: 'blob' }
        )
        .subscribe(response => {
          try {
            const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `Regroupement_${data.regroupementId}.xlsx`;
            link.click();

            setTimeout(() => window.URL.revokeObjectURL(url), 10000);

            resolve();
          } catch (err) {
            console.error('Erreur lors du téléchargement du fichier Excel :', err);
            reject(err);
          }
        }, error => {
          console.error('Erreur lors du téléchargement du fichier Excel :', error);
          reject(error);
        });
    });
  }

  GetRetourWithArtilesList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/retours/with-articles?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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
  GetEcartEmballageList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/ecart-emballage/ecarts-a-payer?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&nom=${data.nom}`,{headers}
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
  CreateEcartEmballage(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .post(
          `${this.apiUrl}/v1/ecart-emballage/paiements-ecart`,data,{headers}
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

  GetRaisonRetourPleinList() {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.get(`${this.apiUrl}/v1/raison-retour-plein?paginate=false`, { headers }).subscribe(
        (res: any) => { resolve(res); },
        (err) => { reject(err); }
      );
    });
  }

  CreateRetourPlein(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/retours-pleins`, data, { headers }).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  GetRetourPleinList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/retours-pleins?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}${data.numRetour ? '&numRetour=' + encodeURIComponent(data.numRetour) : ''}${data.dateDebut ? '&dateDebut=' + data.dateDebut : ''}${data.dateFin ? '&dateFin=' + data.dateFin : ''}${data.client ? '&client=' + encodeURIComponent(data.client) : ''}${data.statut ? '&statut=' + encodeURIComponent(data.statut) : ''}${data.agent ? '&agent=' + encodeURIComponent(data.agent) : ''}${data.typeRetour ? '&typeRetour=' + encodeURIComponent(data.typeRetour) : ''}${data.depotId ? '&depotId=' + data.depotId : ''}`,{headers}
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

            const newTab = window.open(url);
            if (!newTab) {
              throw new Error('Le popup a été bloqué par le navigateur.');
            }

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

  GetBonLivraisonPdf(numCommande: string) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      });
      this._http
        .post(
          `${this.apiUrl}/v1/regroupements/${numCommande}/bon-livraison`,
          {},
          { headers, responseType: 'blob' }
        )
        .subscribe(response => {
          try {
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const newTab = window.open(url);
            if (!newTab) throw new Error('Popup bloqué par le navigateur.');
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
            resolve();
          } catch (err) {
            console.error('Erreur ouverture PDF :', err);
            reject(err);
          }
        }, async (error) => {
          console.error('Erreur téléchargement BL PDF :', error);
          // Lire le message depuis le blob d'erreur
          try {
            const text = await (error.error as Blob).text();
            const parsed = JSON.parse(text);
            reject({ error: parsed });
          } catch {
            reject(error);
          }
        });
    });
  }

}
