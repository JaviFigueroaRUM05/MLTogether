import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from './project';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private httpClient: HttpClient) { 
  }

  SERVER = environment.apiHost;
  
  getProjectById$(id: string): Observable<Project> {
    return this.httpClient.get<Project>(`${this.SERVER}/projects/${id}`);
  }

  getAllProjectsByOwner(){
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders().set('Authorization',  `${token}`);
    return this.httpClient.get<any[]>(`${this.SERVER}/projects/owner`, { headers });
  }

  createProj(project: Project){
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders().set('Authorization',  `${token}`);
    return this.httpClient.post<Project>(`${this.SERVER}/projects`, project, { headers } ).pipe(
      tap((res:  Project ) => {
        if (res.id) {
          localStorage.setItem("ID", res.id.toString());
        }
      })
    );
  }
}
