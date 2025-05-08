import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BackendService {

  private baseUrl = '/api/v1';
  private authUrl = `${this.baseUrl}/auth`;
  private loginUrl = `${this.authUrl}/login`;

  constructor(private http: HttpClient) {}


  login(email: string, password: string): Observable<any> {
    return this.http.post<{ accessToken: string }>(this.loginUrl, {
      email,
      password
    });
  }

}


