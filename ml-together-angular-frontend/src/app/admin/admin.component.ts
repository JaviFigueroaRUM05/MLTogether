import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Project } from '../project';
import { ProjectService } from '../project.service';
import { FormBuilder, FormGroup, Validators } from  '@angular/forms';
import { environment } from '../../environments/environment';

import {Projects} from '../mock-projects'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {  

  userName: string;
  selProj: Project;
  email: string;
  // project;
  statusClass = 'h-profile-settings';
  style = 'overlay';
  // projects = [];
  projects = Projects;
  host = environment.workerFilesHost;
  
  constructor(private authService: AuthService, private router: Router, private projectService : ProjectService, private route: ActivatedRoute, private formBuilder: FormBuilder) { }  

  ngOnInit() {
    this.userName = localStorage.getItem("USERNAME");
    this.email = localStorage.getItem("EMAIL");
    // this.initProjects()
  } 

  logout(){
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
  onSelect(project: Project): void {
    this.selProj = project;
    this.style = 'h-overlay';
  }
  initProjects(){
    this.projectService.getAllProjectsByOwner().subscribe( (projects) => {
      this.projects = projects
    });
  }
  toggle() {
    this.statusClass = 'profile-settings';
  }
  untoggle(){
    this.statusClass = 'h-profile-settings';
  }
  // clip(){
  //   var copy = document.getElementById('link-head').textContent;
    
  // }

}
