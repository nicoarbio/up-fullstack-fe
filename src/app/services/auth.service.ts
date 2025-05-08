import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { BackendService } from '@connectors/backend.service';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private tokenKey = 'accessToken';

  constructor(private backendConnector: BackendService) {}

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(email: string, password: string): Observable<any> {
    // TODO use RSA key to encrypt the password
    return this.backendConnector.login(email, password).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.accessToken);
      })
    )
  }

  /** TODO save in localStorage:
   * - accessToken
   * - refreshToken
   * - JWT info: userID, email, name
   * - profile endpoint info
   */
  getUser(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (e) {
      return null;
    }
  }

}
