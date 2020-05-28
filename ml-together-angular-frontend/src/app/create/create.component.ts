import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  form: FormGroup;
  isSubmitted  =  false;
  constructor(private router: Router, private projectService : ProjectService, private route: ActivatedRoute, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.form  =  this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
  });
  }
  
  create(){
    this.isSubmitted=true;
    console.log(this.form.value);
    if(this.form.invalid){
        return;
    }
    this.projectService.createProj(this.form.value).subscribe((res)=>{
      // console.log("Logged in!");
      this.router.navigateByUrl('/view'+localStorage.getItem("ID"));
    });
  }

  get formControls() { 
    return this.form.controls;
  }

}
