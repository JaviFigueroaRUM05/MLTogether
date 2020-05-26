import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Project } from '../project';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {  

  userName: string;
  email: string;
  project;
  statusClass = 'h-profile-settings';
  constructor(private authService: AuthService, private router: Router, private projectService : ProjectService, private route: ActivatedRoute,) { }  
  
  ngOnInit() {
    this.userName = localStorage.getItem("USERNAME");
    this.email = localStorage.getItem("EMAIL");
  } 

  logout(){
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  initProjects(){
    this.project = this.projectService.getAllProjectsByOwner(this.userName);
  }
  toggle() {
    this.statusClass = 'profile-settings';
  }
  untoggle(){
    this.statusClass = 'h-profile-settings';
  }


}
