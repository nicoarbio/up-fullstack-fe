import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {EmailPasswordLoginRequestDto, LoginResponseDto} from '@models/login.dto';

@Injectable({ providedIn: 'root' })
export class BackendService {

  private baseUrl = '/api/v1';
  private authUrl = `${this.baseUrl}/auth`;
  private loginUrl = `${this.authUrl}/login`;

  constructor(private http: HttpClient) {}


  login(dto: EmailPasswordLoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(this.loginUrl, dto);
  }

}


