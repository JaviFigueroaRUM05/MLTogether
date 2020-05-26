import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

const THEME = 'ace/theme/github'; 
const LANG = 'ace/mode/javascript';

@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: ['./ide.component.css']
})
export class IdeComponent implements OnInit {

  @ViewChild('editor') element
  private editor: ace.Ace.Editor;
  
  constructor() { }

  ngOnInit() {
    this.editor = ace.edit(this.element);
    this.editor.session.setMode(LANG); 
    this.editor.setTheme(THEME); 
    this.editor.session.setTabSize(4);
    this.editor.session.setUseWrapMode(true);
    
  }

  public getContent() {
    if (this.editor) {
        const code = this.editor.getValue();
        return code;
    }
  }

  public executeContent(){
    eval(this.getContent());
  }
  
  public setContent(content: string): void {
    if (this.editor) {
        this.editor.setValue(content);
    }
  }

}
