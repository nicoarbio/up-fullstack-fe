import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EmailPasswordLoginRequestDto, LoginResponseDto, UserProfileDto } from '@models/login.dto';
import { environment } from '@environments/environment';
import { apiEndpoints } from '@environments/api-endpoints';

@Injectable({ providedIn: 'root' })
export class BackendService {

  constructor(private http: HttpClient) {}

  private createUrl(path: string): string {
    return `${environment.backendApiUrl}${path}`;
  }

  login(dto: EmailPasswordLoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(this.createUrl(apiEndpoints.auth.login), dto);
  }

  getUserProfileInfo(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.createUrl(apiEndpoints.profile.get)}`);
  }

}


