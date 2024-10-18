import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArticleServiceService {
  apiUrl: string;
  constructor(private _http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.apiUrl;
  }

  GetTypesArticlesList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/categorie-product?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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
  GetGroupeArticleList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/group-article?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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
      this._http
        .delete(`${this.apiUrl}/v1/categorie-product/${id}`)
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
  updateArticle(id: number, article: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/categorie-product/${id}`, article).subscribe(
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
}
