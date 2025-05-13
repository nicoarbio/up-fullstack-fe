import { EventEmitter, Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { BackendService } from '@connectors/backend.service';
import { EmailPasswordLoginRequestDto, LoginResponseDto, UserProfileDto } from '@models/login.dto';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';

export interface UserJwtPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private loginEventEmitter = new EventEmitter<boolean>();
  public loginEvent$: Observable<boolean> = this.loginEventEmitter.asObservable();

  private tokenKeys = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
  };

  constructor(private backendConnector: BackendService) {}

  login(data: EmailPasswordLoginRequestDto): Promise<void> {
    return this.backendConnector.login(data)
      .then(response => {
        localStorage.setItem(this.tokenKeys.accessToken, response.accessToken);
        localStorage.setItem(this.tokenKeys.refreshToken, response.refreshToken);
        this.loginEventEmitter.emit(true);
      });
  }

  oauthGoogle(jwt: string): Promise<void> {
    return this.backendConnector.oauthGoogle({ googleJWT: jwt })
      .then(response => {
        localStorage.setItem(this.tokenKeys.accessToken, response.accessToken);
        localStorage.setItem(this.tokenKeys.refreshToken, response.refreshToken);
        this.loginEventEmitter.emit(true);
      });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKeys.accessToken);
    localStorage.removeItem(this.tokenKeys.refreshToken);
    this.loginEventEmitter.emit(false);
  }

  async getUserProfileInfo(): Promise<UserProfileDto | null> {
    if (!this.isLoggedIn()) return null;

    return await this.backendConnector.getUserProfileInfo();
  }

  isLoggedIn(): boolean {
    return !!this.getDecodedAccessToken();
  }

  async getValidAccessToken(): Promise<string | null> {
    const accessToken = localStorage.getItem(this.tokenKeys.accessToken);
    const refreshToken = localStorage.getItem(this.tokenKeys.refreshToken);

    if (!accessToken || !refreshToken) return null;

    try {
      const accessJwt = jwtDecode<UserJwtPayload>(accessToken);

      if (!this.isTokenExpired(accessJwt)) {
        return accessToken;
      }

      const refreshJwt = jwtDecode<UserJwtPayload>(refreshToken);
      if (this.isTokenExpired(refreshJwt)) {
        this.logout();
        return null;
      }

      const response = await this.backendConnector.refreshToken(refreshToken);
      const newAccess = response.accessToken;

      localStorage.setItem(this.tokenKeys.accessToken, newAccess);
      return newAccess;

    } catch (e) {
      this.logout();
      return null;
    }
  }

  private isTokenExpired(jwtPayload: UserJwtPayload): boolean {
    const tokenExp = DateTime.fromSeconds(jwtPayload.exp || 0);
    return tokenExp <= DateTime.now();
  }

  private getDecodedAccessToken(): UserJwtPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      return jwtDecode<UserJwtPayload>(token);
    } catch {
      return null;
    }
  }

  private getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKeys.accessToken) || null;
  }

}
