import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleServiceService {
  apiUrl:string;
  constructor(private _http: HttpClient,private configService: ConfigService) { 
    this.apiUrl = this.configService.apiUrl;
  }

  GetGroupeArticleList(data:any){
    return new Promise((resolve: any, reject: any) => {
      this._http.get(`${this.apiUrl}/v1/group-article?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`)
        .subscribe((res: any) => {
          console.log(res)
          resolve(res);
        }
          , err => {
            console.log(err);
            reject(err);
          });
        })
  }
}
