import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProjectsComponent } from './projects/projects.component';
import { HomeComponent} from './home/home.component';
import { IdeComponent } from './ide/ide.component';
import { TestProjComponent } from './test-proj/test-proj.component';
import {CreateComponent} from './create/create.component';

const routes: Routes = [
  // { path: '', pathMatch: 'full', redirectTo: 'login'},
  { path: '', component: HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'projects/:projectId', component: ProjectsComponent},
  { path: 'projects/view/:projectID', component: IdeComponent},
  { path: 'projects/test/:projectID', component: TestProjComponent},
  { path: 'create', component: CreateComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
