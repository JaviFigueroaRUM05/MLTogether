import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from './project';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private httpClient: HttpClient) { 
  }

  SERVER = "http://localhost:3000";
  
  getProjectById$(id: string): Observable<Project> {
    return this.httpClient.get<Project>(`${this.SERVER}projects/${id}`);
  }

  getAllProjectsByOwner(owner: string){
    return this.httpClient.get<Project>(`${this.SERVER}projects/${owner}`);
  }
}
