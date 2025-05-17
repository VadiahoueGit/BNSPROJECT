import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({
  providedIn: 'root',
})
export class ArticleServiceService {
  apiUrl: any;
  ListTypeArticles: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListTypePrix: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListPrix: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListArticles: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListGroupesArticles: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListLiquides: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListPlastiquesNu: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListEmballages: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListBouteilleVide: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListGroupeRevendeurs: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListRevendeurs: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListFormats: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListConditionnements: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);

  token: string;
  constructor(
    private localstorage: LocalStorageService,
    private _http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = this.configService.apiUrl;
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      this.ListTypeArticles.next([]);
      this.ListTypePrix.next([]);
      this.ListPrix.next([]);
      this.ListArticles.next([]);
      this.ListGroupesArticles.next([]);
      this.ListLiquides.next([]);
      this.ListPlastiquesNu.next([]);
      this.ListEmballages.next([]);
      this.ListBouteilleVide.next([]);
      this.ListRevendeurs.next([]);
      this.ListGroupeRevendeurs.next([]);
      this.ListFormats.next([]);
      this.ListConditionnements.next([]);

      let data = {};
      Promise.all([
        this.ListFormats.getValue().length === 0
          ? this.GetFormatList()
          : this.Nothing(),
        this.ListConditionnements.getValue().length === 0
          ? this.GetConditionnementList()
          : this.Nothing(),
        this.ListArticles.getValue().length === 0
          ? this.GetArticleList(data)
          : this.Nothing(),
        this.ListPrix.getValue().length === 0
          ? this.GetListPrix(data)
          : this.Nothing(),
        this.ListTypePrix.getValue().length === 0
          ? this.GetListTypePrix(data)
          : this.Nothing(),
        this.ListTypeArticles.getValue().length === 0
          ? this.GetTypesArticlesList(data)
          : this.Nothing(),
        this.ListGroupesArticles.getValue().length === 0
          ? this.GetGroupeArticleList(data)
          : this.Nothing(),
        this.ListLiquides.getValue().length === 0
          ? this.GetLiquideList(data)
          : this.Nothing(),
        this.ListPlastiquesNu.getValue().length === 0
          ? this.GetPlastiqueNuList(data)
          : this.Nothing(),
        this.ListEmballages.getValue().length === 0
          ? this.GetEmballageList(data)
          : this.Nothing(),
        this.ListBouteilleVide.getValue().length === 0
          ? this.GetBouteilleVideList(data)
          : this.Nothing(),
        this.ListGroupeRevendeurs.getValue().length === 0
          ? this.GetGroupeClientList(data)
          : this.Nothing(),
        this.ListRevendeurs.getValue().length === 0
          ? this.GetListRevendeur(data)
          : this.Nothing(),
      ]).then(
        () => {
          resolve();
        },
        () => {
          reject();
        }
      );
    });
  }

  private Nothing() {
    return true;
  }
  // TYPE ARTICLE
  GetTypesArticlesList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/categorie-product?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode === 200) {
              this.ListTypeArticles.next(res.data);
            }
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

  CreateTypesArticles(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/categorie-product`, data, { headers })
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

  DeleteTypesArticles(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/categorie-product/${id}`, { headers })
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

  UpdateTypesArticles(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/categorie-product/${id}`, data, { headers })
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

  // PRIX
  CreatePrix(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http.post(`${this.apiUrl}/v1/prix`, data, { headers }).subscribe(
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
  CreateTypePrix(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/type-prix`, data, { headers })
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

  GetListPrix(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/prix?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode === 200) {
              this.ListPrix.next(res.data);
            }
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

  GetPrixByProduit(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(`${this.apiUrl}/v1/prix/produit/${data.id}`, { headers })
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
  GetListTypePrix(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/type-prix?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode === 200) {
              this.ListTypePrix.next(res.data);
            }
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

  DeleteTypePrix(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/type-prix/${id}`, { headers })
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
  DeletePrix(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http.delete(`${this.apiUrl}/v1/prix/${id}`, { headers }).subscribe(
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

  UpdatePrix(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/prix/${id}`, data, { headers })
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
  UpdateTypePrix(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/type-prix/${id}`, data, { headers })
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

  // GROUPE ARTICLE
  CreateGroupeArticle(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/group-article`, data, { headers })
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

  GetGroupeArticleList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/group-article?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.ListGroupesArticles.next(res.data);
            }
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

  UpdateGroupeArticle(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/group-article/${id}`, data, { headers })
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

  DeleteGroupeArticle(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/group-article/${id}`, { headers })
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

  //LIQUIDE
  CreateLiquide(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http.post(`${this.apiUrl}/v1/liquide`, data, { headers }).subscribe(
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

  GetLiquideList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/liquide?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.ListLiquides.next(res.data);
            }
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

  UpdateLiquide(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/liquide/${id}`, data, { headers })
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

  DeleteLiquide(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/liquide/${id}`, { headers })
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

  // EMBALLAGE
  CreateEmballage(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/emballage`, data, { headers })
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

  GetEmballageList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/emballage?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.ListEmballages.next(res.data);
            }
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

  UpdateEmballage(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/emballage/${id}`, data, { headers })
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

  DeleteEmballage(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/emballage/${id}`, { headers })
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

  // ARTICLE
  GetArticleList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/product?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.ListArticles.next(res.data);
            }
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

  GetArticleListByDepot(depotId: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(`${this.apiUrl}/v1/movements/${depotId}/articles`, { headers })
        .subscribe(
          (res: any) => {
            // if (res.statusCode == 200) {
            //   this.ListArticles.next(res.data);
            // }
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
  DeletedArticle(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/product/${id}`, { headers })
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

  UpdateArticle(id: number, article: FormData) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/product/${id}`, article, { headers })
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

  CreateArticle(article: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/product`, article, { headers })
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
  GetFormatList() {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(`${this.apiUrl}/v1/product/formats`, { headers })
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.ListFormats.next(res);
            }
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
  GetConditionnementList() {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(`${this.apiUrl}/v1/product/conditionnements`, { headers })
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.ListConditionnements.next(res);
            }
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

  // PLASTIQUE NU

  CreatePlastiqueNu(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/plastique-nu`, data, { headers })
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

  GetPlastiqueNuList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/plastique-nu?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.ListPlastiquesNu.next(res.data);
            }
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

  UpdatePlastiqueNu(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/plastique-nu/${id}`, data, { headers })
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

  DeletePlastiqueNu(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/plastique-nu/${id}`, { headers })
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
  // BOUTEILLE VIDE

  CreateBouteilleVide(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/Bouteille`, data, { headers })
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

  GetBouteilleVideList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/Bouteille?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode === 200) {
              this.ListBouteilleVide.next(res.data);
            }
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

  UpdateBouteilleVide(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/Bouteille/${id}`, data, { headers })
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

  DeleteBouteilleVide(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/Bouteille/${id}`, { headers })
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
  GetGroupeClientList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/groupe-revendeur?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.ListGroupeRevendeurs.next(res.data);
            }
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

  //STOCK

  TransfertStock(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/movements/transfert`, data, { headers })
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
  SaveStock(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/movements`, data, { headers })
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

  OutPutStock(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/movements/sortie`, data, { headers })
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
  GetStockByDepot(depotId: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(`${this.apiUrl}/v1/movements/${depotId}/articles`, { headers })
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

  GetStockDisponibleByDepot(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/movements/${data.productId}/available-quantity/${data.depotId}`,
          { headers }
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

  GetStocksDetails() {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(`${this.apiUrl}/v1/movements/stock-details`, { headers })
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

  //INVENTAIRE
  SaveInventaire(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/inventaire`, data, { headers })
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

  GetInventaire(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/inventaire?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
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
  DeletedInventaire(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/inventaire/${id}`, { headers })
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

  GetMouvementStock(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/log-all/movements/log?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res.data);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }
  // REVENDEUR

  GetListRevendeur(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/revendeur?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            if (res.statusCode === 200) {
              this.ListRevendeurs.next(res.data);
            }
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }
  CreateRevendeur(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/revendeur`, data, { headers })
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
  UpdateRevendeur(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .put(`${this.apiUrl}/v1/revendeur/${id}`, data, { headers })
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
  DeleteRevendeur(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/revendeur/${id}`, { headers })
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
  ValidateRevendeur(id: number, data: FormData): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .patch(`${this.apiUrl}/v1/revendeur/${id}/validate`, data, { headers })
        .subscribe(
          (res: any) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }
  // COMMANDE GRATUITE

  CreateCommandGratuite(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/commandes-gratuites`, data, { headers })
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
  GetListCommandeGratuite(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/commandes-gratuites?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande}&date=${data.date}&etablissement=${data.etablissement}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            if (res.statusCode === 200) {
              this.ListRevendeurs.next(res.data);
            }
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

  // COMMANDE CLIENT

  CreateCommandClient(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
        'x-app-source': 'BO',
      });
      this._http
        .post(`${this.apiUrl}/v1/commandes-client`, data, { headers })
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
  GetListCommandeClient(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/commandes-client?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroCommande=${data.numeroCommande}&date=${data.date}&etablissement=${data.etablissement}&statut=${data.statut}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            if (res.statusCode === 200) {
              this.ListRevendeurs.next(res.data);
            }
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

  DeleteInventaireArticle(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .delete(`${this.apiUrl}/v1/inventaire/articles/${id}`, { headers })
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
  // COMMANDE FOURNISSEURS

  CreateCommandeFournisseurs(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/commande-fournisseur`, data, { headers })
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
  GetListCommandeFournisseurs(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/commande-fournisseur?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numero=${data.numero}&statut=${data.statut}&typeCommande=${data.typeCommande}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            if (res.statusCode === 200) {
              this.ListRevendeurs.next(res.data);
            }
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

  ValidateCommandeFournisseur(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .patch(`${this.apiUrl}/v1/commande-fournisseur/${id}/valider`, data, {
          headers,
        })
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

  // RECEPTIONS COMMANDE FOURNISSEURS

  CreateReceptionCommandeFournisseurs(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .post(`${this.apiUrl}/v1/reception-commande-fournisseur`, data, {
          headers,
        })
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
  GetListReceptionCommandeFournisseurs(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      this._http
        .get(
          `${this.apiUrl}/v1/reception-commande-fournisseur?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&numeroReception=${data.numeroReception}&numeroBonLivraison=${data.numeroBonLivraison}&dateDebut=${data.dateDebut}&dateFin=${data.dateFin}`,
          { headers }
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            // if (res.statusCode === 200) {
            //   this.ListRevendeurs.next(res.data);
            // }
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
