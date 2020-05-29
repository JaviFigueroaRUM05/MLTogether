import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectService} from '../project.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-test-proj',
  templateUrl: './test-proj.component.html',
  styleUrls: ['./test-proj.component.css']
})
export class TestProjComponent implements OnInit {

  id: string;
  project;
  routeSub: Subscription;
  pageName: string;
  description: string;
  author:string;
  title: string;
  default_log = console.log;
  default_clear = console.clear;
  default_error = console.error;
  default_warn = console.warn;
  
  constructor(private projectService : ProjectService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this._routeSubs();
    this.project = this.projectService.getProjectById$(this.id);
    this._setPageParams(this.project.title, this.project.author, this.project.description);
      console.log = function (...args) {
        for (let arg of args) {
            if (typeof arg == 'object') {
                document.getElementById('console').append((JSON && JSON.stringify ? JSON.stringify(arg, undefined, 2) : arg) + ' ');
            } else {
                document.getElementById('console').append(arg + ' ');
            }
        }
        document.getElementById('console').append('\n\u00bb  ');
        // document.getElementById('console').get(0).scrollTop = document.getElementById('console').get(0).scrollHeight; //scrolled down
        try{
        this.default_log(...args)
        } catch (TypeError){
          // document.getElementById('console').append('\n log');
        }
      }
      console.error = function (e) {
          document.getElementById('console').append("Error: " + e);
          document.getElementById('console').append('\n\u00bb  ');
          // document.getElementById('console').get(0).scrollTop = document.getElementById('console').get(0).scrollHeight; //scrolled down
          try{
            this.default_error(e)
          }
          catch(TypeError){
            // document.getElementById('console').append('\n error');
          }
      }
      console.warn = function (w) {
          document.getElementById('console').append("Warning: " + w);
          document.getElementById('console').append('\n\u00bb  ');
          // document.getElementById('console').get(0).scrollTop = document.getElementById('console').get(0).scrollHeight; //scrolled down
          try{
            this.default_warn(w)
          }
          catch(TypeError){
          }
      }
      console.clear = function () {
          // document.getElementById('console').html("&raquo;  ");
          try{
            this.default_clear();
          }
          catch(TypeError){
            document.getElementById('console').textContent = "\u00bb  ";
          }
      }
  }

  clear(){
    console.clear();
  }

  private _routeSubs() {
    this.routeSub = this.route.params
      .subscribe(params => {
        this.id = params['id'];
    });
  }

  private _setPageParams(title:string, author:string, description:string){
    this.author = author;
    this.description = description;
    this.title = title;
  }
}
