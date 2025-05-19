import { EventEmitter, Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { BackendService } from '@connectors/backend.service';
import { EmailPasswordLoginRequestDto, LoginResponseDto, UserProfile } from '@models/user.dto';
import { DateTime } from 'luxon';
import { Observable, of, switchMap, tap } from 'rxjs';

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

  login(data: EmailPasswordLoginRequestDto): Observable<LoginResponseDto> {
    return this.backendConnector.login(data)
      .pipe(tap(this.setLoginState.bind(this)));
  }

  oauthGoogle(jwt: string): Observable<LoginResponseDto> {
    return this.backendConnector.oauthGoogle({ googleJWT: jwt })
      .pipe(tap(this.setLoginState.bind(this)));
  }

  private setLoginState(response: LoginResponseDto): void {
    localStorage.setItem(this.tokenKeys.accessToken, response.accessToken);
    localStorage.setItem(this.tokenKeys.refreshToken, response.refreshToken);
    this.loginEventEmitter.emit(true);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKeys.accessToken);
    localStorage.removeItem(this.tokenKeys.refreshToken);
    this.loginEventEmitter.emit(false);
  }

  getUserProfileInfo(): Observable<UserProfile | null> {
    return this.isLoggedIn().pipe(switchMap(loggedIn => {
      if (!loggedIn) return of(null);
      return this.backendConnector.getUserProfileInfo();
    }));
  }

  isLoggedIn(): Observable<boolean> {
    return this.getValidAccessToken().pipe(
      switchMap(accessToken => {
        if (accessToken) {
          return of(true);
        }
        return of(false);
      })
    );
  }

  getValidAccessToken(): Observable<string | null> {
    const accessToken = this.getLocalStorageAccessToken();
    const refreshToken = this.getLocalStorageRefreshToken();

    if (!accessToken || !refreshToken) return of(null);

    try {
      const accessJwt = jwtDecode<UserJwtPayload>(accessToken);

      if (!this.isTokenExpired(accessJwt)) {
        return of(accessToken);
      }

      const refreshJwt = jwtDecode<UserJwtPayload>(refreshToken);
      if (this.isTokenExpired(refreshJwt)) {
        this.logout();
        return of(null);
      }

      return this.backendConnector.refreshToken(refreshToken)
        .pipe(switchMap(response => {
            const newAccess = response.accessToken;
            localStorage.setItem(this.tokenKeys.accessToken, newAccess);
            return newAccess;
          }));
    } catch (e) {
      this.logout();
      return of(null);
    }
  }

  private getDecodedAccessToken(): UserJwtPayload | null {
    const token = this.getLocalStorageAccessToken();
    if (!token) return null;

    try {
      return jwtDecode<UserJwtPayload>(token);
    } catch {
      return null;
    }
  }

  private getLocalStorageAccessToken(): string | null {
    return localStorage.getItem(this.tokenKeys.accessToken);
  }

  private getLocalStorageRefreshToken(): string | null {
    return localStorage.getItem(this.tokenKeys.refreshToken);
  }

  private isTokenExpired(jwtPayload: UserJwtPayload): boolean {
    const tokenExp = DateTime.fromSeconds(jwtPayload.exp || 0);
    return tokenExp <= DateTime.now();
  }

}
