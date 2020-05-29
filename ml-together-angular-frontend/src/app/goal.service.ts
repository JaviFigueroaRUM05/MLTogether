import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Goal } from './goal';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class GoalService {
  routeSub: Subscription;
  constructor(private httpClient: HttpClient, private route: ActivatedRoute) { }

  SERVER = environment.apiHost;

  createGoal(goal: Goal, id){
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders().set('Authorization',  `${token}`);
    return this.httpClient.post<Goal>(`${this.SERVER}/projects/`+id+`/goal`, goal, { headers } ).pipe(
      tap((res:  Goal ) => {
        if (res.id) {
          localStorage.setItem("ID", res.id.toString());
        }
      })
    );
  }
}
