import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8000/datasources';

  constructor(private http: HttpClient) { }

  getDataSources(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
