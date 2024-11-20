import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service'; 
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false; 

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    // If the user is already logged in, redirect them to the dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return; // Stop further execution to prevent showing the login form
    }

    // Check for stored credentials in cookies and populate the fields
    const storedEmail = this.cookieService.get('email');
    const storedPassword = this.cookieService.get('password');
    const storedRememberMe = this.cookieService.get('rememberMe');

    if (storedEmail) {
      this.email = storedEmail;
    }

    if (storedPassword) {
      this.password = storedPassword;
    }

    if (storedRememberMe) {
      this.rememberMe = true;
    }
  }

  onSubmit() {
    this.authService.login(this.email, this.password, this.rememberMe);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
