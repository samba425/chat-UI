import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.authTokenUrl;
  private registerUrl = environment.authRegisterUrl;
  private tokenKey = environment.authTokenKey;
  private usernameSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('username')?.split('@')[0] || null);
  public username$ = this.usernameSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any, password: string): Observable<any> {
    // Fallback for demo user if server is not working
    if (credentials.email === 'demo' && password === 'demo123') {
      const dummyToken = 'demo-token-123';
      this.setToken(dummyToken);
      sessionStorage.setItem('username', credentials.email);
      this.usernameSubject.next(credentials.email);
      console.log('Login Successful', `Welcome back, ${credentials.email}!`);
      return of({ access_token: dummyToken, username: credentials.email });
    }
    return this.http.post<any>(this.apiUrl, { email: credentials.email, password }).pipe(
      tap(response => {
        if (response && response.access_token) {
          this.setToken(response.access_token);
          sessionStorage.setItem('username', credentials.email);
          this.usernameSubject.next(credentials.email);
          console.log('Login Successful', `Welcome back, ${credentials.email}!`);
        }
      }),
      catchError(err => {
        let errorMessage = 'Incorrect username or password.';
        if (err.error && err.error.detail) {
          if (Array.isArray(err.error.detail) && err.error.detail.length > 0 && err.error.detail[0].msg) {
            errorMessage = err.error.detail[0].msg;
          } else if (typeof err.error.detail === 'string') {
            errorMessage = err.error.detail;
          }
        }

        console.error('Login Failed', errorMessage);
        return throwError(() => err);
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(this.registerUrl, { username, email, password }).pipe(
      tap(() => {
        console.log('Registration Successful', 'You can now log in.');
      }),
      catchError(err => {
        console.error('Registration Failed', err.error.detail || 'An error occurred. Please try again.');
        return throwError(() => err);
      })
    );
  }

  logout(isTokenIssue: boolean = false): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem('username');
    this.usernameSubject.next(null);
    if (isTokenIssue) {
      console.warn('Session Expired', 'Your session has expired. Please log in again.');
    } else {
      console.log('Logged Out', 'You have been successfully logged out.');
    }
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    // return true
    return !!this.getToken();
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }
}