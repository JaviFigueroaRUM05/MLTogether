import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '../user';
import { FormBuilder, FormGroup, Validators } from  '@angular/forms';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder) { }
  authForm: FormGroup;
  isSubmitted  =  false;

  ngOnInit() {
    this.authForm  =  this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get formControls() { 
    return this.authForm.controls;
  }

  register() {
    console.log(this.authForm.value);
    this.authService.register(this.authForm.value).subscribe((res) => {
      this.router.navigateByUrl('/admin');
    });
  }
}