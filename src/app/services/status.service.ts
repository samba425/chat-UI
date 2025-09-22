import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessingEvent, EventDetails, StatusResponse } from '../models/status.models';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private readonly API_BASE = 'http://localhost:8000';
  private readonly TOKEN_KEY = 'novus_auth_token';

  constructor(private http: HttpClient) {}

  private getAuthToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  fetchEvents(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.API_BASE}/status`, {
      headers: this.getAuthHeaders()
    });
  }

  fetchEventDetails(eventId: string): Observable<EventDetails> {
    return this.http.get<EventDetails>(`${this.API_BASE}/status/${eventId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
