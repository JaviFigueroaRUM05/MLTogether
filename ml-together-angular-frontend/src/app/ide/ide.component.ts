import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as ace from 'ace-builds';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-ambiance';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: ['./ide.component.css']
})
export class IdeComponent implements OnInit {
  @ViewChild('editor') editor;
  private codeEditor: any;
  element;
  default_log = console.log;
  default_clear = console.clear;
  default_error = console.error;
  default_warn = console.warn;
  routeSub: Subscription;
  id: string;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this._routeSubs();
    this.element = document.getElementById('editor');
    this.codeEditor = ace.edit(this.element, {
        value:'function test(m) {\n\treturn m;\n}\nconsole.log(test("Hello World"));',
        theme: 'ace/theme/ambiance',
        mode: 'ace/mode/javascript'
    });
      (function () {
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
      })();
  }
  exec(){
    eval(this.codeEditor.getValue());
  }
  clear(){
    console.clear();
  }
  upload(){
    this.router.navigateByUrl('/test/'+this.id);
  }
  private _routeSubs() {
    this.routeSub = this.route.params
      .subscribe(params => {
        this.id = params['projectID'];
    });
  }
}
