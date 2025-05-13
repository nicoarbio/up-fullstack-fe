import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EmailPasswordLoginRequestDto, LoginResponseDto, UserProfileDto } from '@models/login.dto';
import { environment } from '@environments/environment';
import { apiEndpoints } from '@environments/api-endpoints';

@Injectable({ providedIn: 'root' })
export class BackendService {

  constructor(private http: HttpClient) {}

  private createUrl(path: string): string {
    return `${environment.backendHost}${path}`;
  }

  async login(dto: EmailPasswordLoginRequestDto): Promise<LoginResponseDto> {
    return await lastValueFrom(
      this.http.post<LoginResponseDto>(this.createUrl(apiEndpoints.auth.login), dto)
    );
  }

  async oauthGoogle(dto: { googleJWT: string }): Promise<LoginResponseDto> {
    return await lastValueFrom(
      this.http.post<LoginResponseDto>(this.createUrl(apiEndpoints.auth.oauth.google), dto)
    );
  }

  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    return await lastValueFrom(
      this.http.post<LoginResponseDto>(this.createUrl(apiEndpoints.auth.refresh), { refreshToken })
    );
  }

  async getUserProfileInfo(): Promise<UserProfileDto> {
    return await lastValueFrom(
      this.http.get<UserProfileDto>(`${this.createUrl(apiEndpoints.profile.get)}`)
    );
  }

}


