import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from './project';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private httpClient: HttpClient) { 
  }

  SERVER = "http://localhost:3000/api";
  
  getProjectById$(id: string): Observable<Project> {
    return this.httpClient.get<Project>(`${this.SERVER}/projects/${id}`);
  }

  getAllProjectsByOwner(owner: string){
    return this.httpClient.get<Project>(`${this.SERVER}/projects/${owner}`);
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
