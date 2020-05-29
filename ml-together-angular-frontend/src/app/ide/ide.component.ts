import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as ace from 'ace-builds';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-ambiance';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {IdeTemplate} from './ide-template';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProjectService } from '../project.service';
@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: ['./ide.component.css']
})
export class IdeComponent implements OnInit {
  @ViewChild('editor') editor;
  @ViewChild('editor-2') editor2;
  @ViewChild('editor-3') editor3;
  private codeEditor: any;
  private codeEditor2: any;
  private codeEditor3: any;
  element;
  element2;
  element3;
  // default_log = console.log;
  // default_clear = console.clear;
  // default_error = console.error;
  // default_warn = console.warn;
  routeSub: Subscription;
  id: string;
  form: FormGroup;
  isSubmitted  =  false;

  constructor(private router: Router, private route: ActivatedRoute, private projectService : ProjectService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form  =  this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
    this._routeSubs();
    this.element = document.getElementById('editor');
    this.codeEditor = ace.edit(this.element, {
        value: IdeTemplate,
        theme: 'ace/theme/ambiance',
        mode: 'ace/mode/javascript'
    });
    this.element2 = document.getElementById('editor-2');
    this.codeEditor2 = ace.edit(this.element2, {
        value: IdeTemplate,
        theme: 'ace/theme/ambiance',
        mode: 'ace/mode/javascript'
    });
    this.element3 = document.getElementById('editor-3');
    this.codeEditor3 = ace.edit(this.element3, {
        value: IdeTemplate,
        theme: 'ace/theme/ambiance',
        mode: 'ace/mode/javascript'
    });
    
      // (function () {
        // console.log = function (...args) {
        //   for (let arg of args) {
        //       if (typeof arg == 'object') {
        //           document.getElementById('console').append((JSON && JSON.stringify ? JSON.stringify(arg, undefined, 2) : arg) + ' ');
        //       } else {
        //           document.getElementById('console').append(arg + ' ');
        //       }
        //   }
        //   document.getElementById('console').append('\n\u00bb  ');
        //   // document.getElementById('console').get(0).scrollTop = document.getElementById('console').get(0).scrollHeight; //scrolled down
        //   try{
        //   this.default_log(...args)
        //   } catch (TypeError){
        //     // document.getElementById('console').append('\n log');
        //   }
        // }
        // console.error = function (e) {
        //     document.getElementById('console').append("Error: " + e);
        //     document.getElementById('console').append('\n\u00bb  ');
        //     // document.getElementById('console').get(0).scrollTop = document.getElementById('console').get(0).scrollHeight; //scrolled down
        //     try{
        //       this.default_error(e)
        //     }
        //     catch(TypeError){
        //       // document.getElementById('console').append('\n error');
        //     }
        // }
        // console.warn = function (w) {
        //     document.getElementById('console').append("Warning: " + w);
        //     document.getElementById('console').append('\n\u00bb  ');
        //     // document.getElementById('console').get(0).scrollTop = document.getElementById('console').get(0).scrollHeight; //scrolled down
        //     try{
        //       this.default_warn(w)
        //     }
        //     catch(TypeError){
        //     }
        // }
        // console.clear = function () {
        //     // document.getElementById('console').html("&raquo;  ");
        //     try{
        //       this.default_clear();
        //     }
        //     catch(TypeError){
        //       document.getElementById('console').textContent = "\u00bb  ";
        //     }
        // }
      // })();
    
  }
  exec(){
    eval(this.codeEditor.getValue());
    eval(this.codeEditor2.getValue());
    eval(this.codeEditor3.getValue());
  }
  clear(){
    console.clear();
  }
  upload(){
    // const payload = JSON.parse(this.codeEditor.getValue());

    // console.log(payload);
    this.isSubmitted=true;
    console.log(this.form.value);
    if(this.form.invalid){
        return;
    }
  }
  private _routeSubs() {
    this.routeSub = this.route.params
      .subscribe(params => {
        this.id = params['projectID'];
    });
  }

  get formControls() { 
    return this.form.controls;
  }
  
}
