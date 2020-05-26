import { Component, OnInit } from '@angular/core';
import { Project} from '../project';
import { ProjectService} from '../project.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  id: string;
  project;
  routeSub: Subscription;
  pageName: string;
  description: string;
  author:string;
  projectName: string;

  constructor(private projectService : ProjectService, private route: ActivatedRoute, private name: Title) {
  }

  ngOnInit() {
    this._routeSubs();
    this.project = this.projectService.getProjectById$(this.id);
    this._setPageParams(this.project.name, this.project.author, this.project.description);
  }

  private _routeSubs() {
    this.routeSub = this.route.params
      .subscribe(params => {
        this.id = params['id'];
    });
  }

  private _setPageParams(name:string, author:string, description:string){
    this.pageName = name;
    this.name.setTitle(name);
    this.author = author;
    this.description = description;
    this.projectName = name;
  }
}
