import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EmailPasswordLoginRequestDto, LoginResponseDto, UserProfile } from '@models/user.dto';
import { environment } from '@environments/environment';
import { apiEndpoints } from '@environments/api-endpoints';
import { BookingsRequestDto, BookingsResponseDto } from '@models/booking.dto';

@Injectable({ providedIn: 'root' })
export class BackendService {

  constructor(private http: HttpClient) {}

  login(dto: EmailPasswordLoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(this.createUrl(apiEndpoints.auth.login), dto);
  }

  oauthGoogle(dto: { googleJWT: string }): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(this.createUrl(apiEndpoints.auth.oauth.google), dto);
  }

  refreshToken(refreshToken: string): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(this.createUrl(apiEndpoints.auth.refresh), { refreshToken });
  }

  getUserProfileInfo(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.createUrl(apiEndpoints.profile.get)}`);
  }

  getBookings(params: BookingsRequestDto): Observable<BookingsResponseDto> {
    return this.http.get<BookingsResponseDto>(`${this.createUrl(apiEndpoints.bookings.get, params)}`);
  }

  authCheck(): Observable<any> {
    return this.http.get<any>(`${this.createUrl(apiEndpoints.auth.check)}`);
  }

  private createUrl(path: string, params?: any): string {
    let url = `${environment.backendHost}${path}`;
    if (params) {
      const queryParams = new URLSearchParams();
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          queryParams.append(key, params[key]);
        }
      }
      url += `?${queryParams.toString()}`;
    }
    return url;
  }

}


