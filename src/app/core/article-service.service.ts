import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ArticleServiceService {
  apiUrl: string;
  ListTypeArticles: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListGroupesArticles: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListLiquides: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListPlastiquesNu: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListEmballages: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListBouteilleVide: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);

  constructor(private _http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.apiUrl;
  }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      this.ListTypeArticles.next([]);
      this.ListGroupesArticles.next([]);
      this.ListLiquides.next([]);
      this.ListPlastiquesNu.next([]);
      this.ListEmballages.next([]);
      this.ListBouteilleVide.next([]);

      let data = {};
      Promise.all([
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
      ]).then(() => {
        resolve();
      }, () =>
      {
        reject();
      });
    });
  }

  private Nothing() {
    return true;
  }
  // TYPE ARTICLE
  GetTypesArticlesList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/categorie-product?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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

  CreateTypesArticlesList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/categorie-product`, data).subscribe(
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

  DeleteTypesArticlesList(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http.delete(`${this.apiUrl}/v1/categorie-product/${id}`).subscribe(
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

  UpdateTypesArticlesList(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .put(`${this.apiUrl}/v1/categorie-product/${id}`, data)
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
      this._http.post(`${this.apiUrl}/v1/prix`, data).subscribe(
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
      this._http
        .get(
          `${this.apiUrl}/v1/prix?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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

  GetListTypePrix(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/type-prix?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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

  DeletePrix(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http.delete(`${this.apiUrl}/v1/prix/${id}`).subscribe(
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
      this._http.put(`${this.apiUrl}/v1/prix/${id}`, data).subscribe(
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
      this._http.post(`${this.apiUrl}/v1/group-article`, data).subscribe(
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
      this._http
        .get(
          `${this.apiUrl}/v1/group-article?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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
      this._http.put(`${this.apiUrl}/v1/group-article/${id}`, data).subscribe(
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
      this._http.delete(`${this.apiUrl}/v1/group-article/${id}`).subscribe(
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
      this._http.post(`${this.apiUrl}/v1/emballage`, data).subscribe(
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
      this._http
        .get(
          `${this.apiUrl}/v1/emballage?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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
      this._http.put(`${this.apiUrl}/v1/emballage/${id}`, data).subscribe(
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
      this._http.delete(`${this.apiUrl}/v1/emballage/${id}`).subscribe(
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
      this._http.post(`${this.apiUrl}/v1/emballage`, data).subscribe(
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
      this._http
        .get(
          `${this.apiUrl}/v1/emballage?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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
      this._http.put(`${this.apiUrl}/v1/emballage/${id}`, data).subscribe(
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
      this._http.delete(`${this.apiUrl}/v1/emballage/${id}`).subscribe(
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
      this._http
        .get(
          `${this.apiUrl}/v1/product?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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

  DeleteArticle(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http.delete(`${this.apiUrl}/v1/categorie-product/${id}`).subscribe(
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

  updateArticle(id: number, article: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .put(`${this.apiUrl}/v1/categorie-product/${id}`, article)
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

  createArticle(article: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/categorie-product`, article).subscribe(
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

  // PLASTIQUE NU

  CreatePlastiqueNu(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/plastique-nu`, data).subscribe(
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
      this._http
        .get(
          `${this.apiUrl}/v1/plastique-nu?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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
      this._http.put(`${this.apiUrl}/v1/plastique-nu/${id}`, data).subscribe(
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
      this._http.delete(`${this.apiUrl}/v1/plastique-nu/${id}`).subscribe(
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
      this._http.post(`${this.apiUrl}/v1/Bouteille`, data).subscribe(
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
      this._http
        .get(
          `${this.apiUrl}/v1/Bouteille?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode === 200) {
              this.ListBouteilleVide.next(res.data)
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
      this._http.put(`${this.apiUrl}/v1/Bouteille/${id}`, data).subscribe(
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
      this._http.delete(`${this.apiUrl}/v1/Bouteille/${id}`).subscribe(
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
