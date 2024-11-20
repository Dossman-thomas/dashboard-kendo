import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.checkInitialAuthState();
    window.addEventListener('popstate', this.handlePopStateEvent.bind(this));
  }

  private checkInitialAuthState() {
    const token = localStorage.getItem('token');
    this.isLoggedInSubject.next(!!token); // Update the subject with the initial value
  }

  private handlePopStateEvent() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoggedInSubject.next(false); // Update the subject if the token is missing
      this.router.navigate(['/login']);
    }
  }

  // Updated login method to handle JWT token
  login(email: string, password: string, rememberMe: boolean): void {
    const loginData = { email, password };
    const headers = { 'Content-Type': 'application/json' };

    this.http
      .post<any>('http://localhost:5000/api/auth/login', loginData, { headers })
      .subscribe({
        next: (response) => {
          const { token, user } = response.data;

          // Store the token and user in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('currentUser', JSON.stringify(user));

          // Handle "Remember Me" functionality
          if (rememberMe) {
            this.cookieService.set('email', email, 90); // Save email for 90 days
            this.cookieService.set('password', password, 90); // Save password for 90 days
            this.cookieService.set('rememberMe', 'true', 90); // Save "remember me" flag
          } else {
            // Clear cookies if "Remember Me" is not selected
            this.cookieService.delete('email');
            this.cookieService.delete('password');
            this.cookieService.delete('rememberMe');
          }

          // Update authentication state
          this.isLoggedInSubject.next(true);
          this.userService.setCurrentUser(user);
          console.log('Logged in user:', user.id, user.name, user.role);

          // Notify the user and navigate to dashboard
          alert('Logged in successfully');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login error:', err); // Log the error for debugging
          alert('Invalid credentials. Please try again.');
        },
        complete: () => {
          console.log('Login request completed.');
        },
      });
  }

  logout() {
    // clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.userService.clearCurrentUser();

    // update authentication state
    this.isLoggedInSubject.next(false);

    // navigate to login page after logout
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token'); // Check token presence
  }
}
