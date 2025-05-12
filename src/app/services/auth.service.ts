import { EventEmitter, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { BackendService } from '@connectors/backend.service';
import { EmailPasswordLoginRequestDto } from '@models/login.dto';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  loginEvent = new EventEmitter<boolean>();

  private tokenKey = 'accessToken';

  constructor(private backendConnector: BackendService) {}

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.loginEvent.emit(false);
  }

  login(data: EmailPasswordLoginRequestDto): Observable<any> {
    // TODO use RSA key to encrypt the password
    return this.backendConnector.login(data)
      .pipe(tap(response => {
        localStorage.setItem(this.tokenKey, response.accessToken);
      }))
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
