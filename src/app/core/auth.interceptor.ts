import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { storage_keys } from '../Features/shared-component/utils';
import { LocalStorageService } from './local-storage.service';
import { CoreServiceService } from './core-service.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    token: string
    constructor(private localstorage: LocalStorageService, private authService: CoreServiceService, private router: Router) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Ajoutez le token à chaque requête sortante
        const authToken = this.localstorage.getItem(storage_keys.STOREToken) || '';
        const authReq = authToken ? req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` } }) : req;

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                // Vérifiez si l'erreur est 401 (Unauthorized)
                if (error.status === 401) {
                    localStorage.removeItem(storage_keys.STOREToken);
                    this.router.navigate(['/login']);  // Redirige vers la page de login
                }
                return throwError(error);
            })
        );
    }
}
