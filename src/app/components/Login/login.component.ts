import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone:false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  error = '';
  submitted = false;
  isRegisterMode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['asambasi@cisco.com', Validators.required],
      password: ['12345678', Validators.required]
    });
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: LoginComponent.passwordMatchValidator });
  }
  static passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {}

  get f() { return this.loginForm.controls; }

  get rf() { return this.registerForm.controls; }

  submitHandler() {
    this.error = '';
    if (this.isRegisterMode) {
      this.submitted = true;
      if (this.registerForm.invalid) {
        return;
      }
      const { username, email, password } = this.registerForm.value;
      this.authService.register(username, email, password)
        .subscribe({
          next: () => {
            this.isRegisterMode = false;
            this.error = '';
            this.registerForm.reset();
            this.submitted = false;
          },
          error: (error: any) => {
            // Handle FastAPI/Pydantic validation errors
            if (error.error && Array.isArray(error.error.detail)) {
              const details = error.error.detail;
              let messages: string[] = [];
              details.forEach((d: any) => {
                if (d.loc && d.loc.includes('password')) {
                  messages.push('Password: ' + d.msg);
                } else if (d.loc && d.loc.includes('email')) {
                  messages.push('Email: ' + d.msg);
                } else if (d.loc && d.loc.includes('username')) {
                  messages.push('Username: ' + d.msg);
                } else {
                  messages.push(d.msg);
                }
              });
              this.error = messages.join(' ');
            } else {
              this.error = error.error?.detail || 'Registration failed. Please try again.';
            }
            this.cdr.detectChanges();
          }
        });
    } else {
      this.submitted = true;
      if (this.loginForm.invalid) {
        return;
      }
      const { username, password } = this.loginForm.value;
      this.authService.login({"email": username}, password)
        .subscribe({
          next: () => {
            sessionStorage.setItem('username', this.loginForm.value.username);
            this.router.navigate(['/incident']);
          },
          error: (error: any) => {
            console.error('Login failed:', error);
            // Handle FastAPI/Pydantic validation errors for login
            if (error.error && Array.isArray(error.error.detail)) {
              const details = error.error.detail;
              let messages: string[] = [];
              details.forEach((d: any) => {
                if (d.loc && d.loc.includes('password')) {
                  messages.push('Password: ' + d.msg);
                } else if (d.loc && d.loc.includes('username')) {
                  messages.push('Username: ' + d.msg);
                } else {
                  messages.push(d.msg);
                }
              });
              this.error = messages.join(' ');
            } else if (error.status === 401 && error.error && error.error.detail) {
              this.error = error.error.detail;
            } else if (error.error && error.error.detail) {
              this.error = error.error.detail;
            } else {
              this.error = 'Login failed. Please check your credentials and try again.';
            }
            this.cdr.detectChanges();
          }
        });
    }
  }
  switchMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.error = '';
    this.submitted = false;
    this.loginForm.reset();
    this.registerForm.reset();
  }
}
