import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from  '@angular/forms';
import { Router } from  '@angular/router';
import { AuthService } from  '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder) { }
  authForm: FormGroup;
  isSubmitted  =  false;
  authError;
  
  ngOnInit() {
    this.authForm  =  new FormGroup({
      email: new FormControl('',{
        validators: [Validators.required, Validators.email],
        updateOn: 'blur'
      }),
      password: new FormControl('', {
        validators: [Validators.required],
        updateOn: 'blur'
      })
    })
    
}
  get formControls() { 
    return this.authForm.controls;
  }

  get email() { return this.authForm.get('email'); }
  get password() { return this.authForm.get('password'); }


  signIn(){
    this.isSubmitted=true;
    console.log(this.authForm.value);
    if(this.authForm.invalid){
        return;
    }
    this.authService.signIn(this.authForm.value).subscribe(
      res => this.router.navigateByUrl('/admin'),
      err => {
        console.log(err)
        this.authError = err.error.message}
    );
    // this.isSubmitted = true;
    // if(this.authForm.invalid){
    //   return;
    // }
    // this.authService.signIn(this.authForm.value);
    // this.router.navigateByUrl('/admin');
  }
  resetAuthError(){
    this.authError=null;
  }
}
