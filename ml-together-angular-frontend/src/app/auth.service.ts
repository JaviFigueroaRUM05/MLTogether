import { Injectable } from '@angular/core';
import { User } from './user';
import { Project} from './project';
import { JwtResponse } from  './jwt-response';
import { HttpClient } from '@angular/common/http';
import { tap } from  'rxjs/operators';
import { Observable, BehaviorSubject } from  'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {  
  constructor(private httpClient: HttpClient) { }  
  
  AUTH_SERVER = environment.apiHost;
  authSubject  =  new  BehaviorSubject(false);

  signIn(user: User): Observable<any> {
    return this.httpClient.post(`${this.AUTH_SERVER}/login`, user).pipe(
      tap(async (res: any) => {

        if (res) {
          localStorage.setItem("ACCESS_TOKEN", res.token_id);
          //localStorage.setItem("EXPIRES_IN", res.expires_in);
          localStorage.setItem("USERNAME", res.fullName);
          localStorage.setItem("EMAIL", res.email);
          this.authSubject.next(true);
        }
      })
    );
  }
  
  public isLoggedIn(){
    return localStorage.getItem('ACCESS_TOKEN') !== null;  
  }  

  public logout(){
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("EXPIRES_IN");
    this.authSubject.next(false);
  }

  isAuthenticated() {
    return  this.authSubject.asObservable();
  }

  register(user: User): Observable<any> {
    return this.httpClient.post<any>(`${this.AUTH_SERVER}/register`, user).pipe(
      tap((res:  any ) => {

        if (res) {
          localStorage.setItem("ACCESS_TOKEN", res.token_id);
          //localStorage.setItem("EXPIRES_IN", res.expires_in);
          localStorage.setItem("USERNAME", res.fullName);
          localStorage.setItem("EMAIL", res.email);
          this.authSubject.next(true);
        }
      })

    );
  }
}