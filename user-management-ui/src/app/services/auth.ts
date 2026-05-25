import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn = signal(!!localStorage.getItem('token'));

  private http = inject(HttpClient);

  private apiUrl =
    `${environment.apiBaseUrl}/auth`;


  // private apiUrl = 'https:localhost:7235/api/auth';
  // Mobile Testing
  // private apiUrl = 'https:192.168.1.5:7235/api/auth';
  // private apiUrl =
  //   window.location.hostname === 'localhost'
  //     ? 'http:localhost:5031/api/auth'
  //     : 'http:192.168.1.2:5031/api/auth';

  // REGISTER API
  register(body: any) {

    return this.http.post(
      `${this.apiUrl}/register`,
      body
    );
  }

  // LOGIN API
  login(body: any) {

    return this.http.post<any>(
      `${this.apiUrl}/login`,
      body
    );
  }

  // LOGOUT
  logout() {

    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
  }

  // GET TOKEN
  getToken(): string | null {

    return localStorage.getItem('token');
  }

  getCurrentUserEmail(): string | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      // Read the logged-in user's email directly from the JWT payload.
      const payload = token.split('.')[1];

      if (!payload) {
        return null;
      }

      const normalizedPayload = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payload.length / 4) * 4, '=');

      const decodedPayload = JSON.parse(atob(normalizedPayload));

      return (
        decodedPayload.email ??
        decodedPayload.unique_name ??
        decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
        null
      );
    } catch {
      return null;
    }
  }
}
