import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // loadScripts() { 
  
  //   // This array contains all the files/CDNs 
  //   const dynamicScripts = [ 
  //      'assets/home.js'
  //   ]; 
  //   for (let i = 0; i < dynamicScripts.length; i++) { 
  //     const node = document.createElement('script'); 
  //     node.src = dynamicScripts[i]; 
  //     node.type = 'text/javascript'; 
  //     node.async = false; 
  //     document.getElementsByTagName('head')[0].appendChild(node); 
  //   } 
  // }
}
