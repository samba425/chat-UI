import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subscription, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ImportEvent {
  type: 'log' | 'progress' | 'complete';
  message?: string;
  value?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private progressSubject = new BehaviorSubject<number>(0);
  progress$: Observable<number> = this.progressSubject.asObservable();

  private logsSubject = new BehaviorSubject<string[]>([]);
  logs$: Observable<string[]> = this.logsSubject.asObservable();

  private isImportingSubject = new BehaviorSubject<boolean>(false);
  isImporting$: Observable<boolean> = this.isImportingSubject.asObservable();

  private importCompleteSubject = new BehaviorSubject<boolean>(false);
  importComplete$: Observable<boolean> = this.importCompleteSubject.asObservable();

  private selectedFileSubject = new BehaviorSubject<File | null>(null);
  selectedFile$: Observable<File | null> = this.selectedFileSubject.asObservable();

  private taskIdSubject = new BehaviorSubject<string | null>(null);
  taskId$: Observable<string | null> = this.taskIdSubject.asObservable();

  private taskStatusSubject = new BehaviorSubject<any | null>(null);
  taskStatus$: Observable<any | null> = this.taskStatusSubject.asObservable();

  private importSubscription: Subscription | null = null;

  constructor(private http: HttpClient) { }

  selectFile(file: File) {
    this.reset();
    this.selectedFileSubject.next(file);
  }

  startImport(chunkSize: number): void {
    const file = this.selectedFileSubject.getValue();
    if (!file || this.isImportingSubject.getValue()) {
      return;
    }

    const authToken = sessionStorage.getItem('authToken');
    if (!authToken) {
      this.logsSubject.next([...this.logsSubject.getValue(), 'Auth token not found']);
      return;
    }

    this.isImportingSubject.next(true);
    this.importCompleteSubject.next(false);
    this.logsSubject.next([`Starting import of ${file.name}...`]);
    this.progressSubject.next(0);

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('tenant_id', 'NOVUS_RAG');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });

    const req = new HttpRequest('POST', 'http://localhost:8000/upload', formData, {
      reportProgress: true,
      headers: headers
    });

    this.importSubscription = this.http.request(req).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            const progress = Math.round(100 * event.loaded / event.total);
            this.progressSubject.next(progress);
            this.logsSubject.next([...this.logsSubject.getValue(), `Upload progress: ${progress}%`]);
          }
        } else if (event instanceof HttpResponse) {
          this.logsSubject.next([...this.logsSubject.getValue(), 'File uploaded successfully. Processing on server...']);
          
          const responseBody = event.body as any;

          if (responseBody && responseBody.event_id) {
            // this.jobIdSubject.next(responseBody.job_id);
            this.taskIdSubject.next(responseBody.event_id);
            this.logsSubject.next([
              ...this.logsSubject.getValue(),
              `Event ID: ${responseBody.event_id}`
            ]);
          }

          this.isImportingSubject.next(false);
          this.importCompleteSubject.next(true);
          this.progressSubject.next(100);
          
          if (this.importSubscription) {
            this.importSubscription.unsubscribe();
            this.importSubscription = null;
          }
        }
      }),
      catchError(err => {
        this.logsSubject.next([...this.logsSubject.getValue(), `An error occurred during import: ${err.message}`]);
        this.isImportingSubject.next(false);
        if (this.importSubscription) {
            this.importSubscription.unsubscribe();
            this.importSubscription = null;
        }
        return EMPTY;
      })
    ).subscribe();
  }

  checkTaskStatus(event_id: string) {
    if (!event_id) {
      this.taskStatusSubject.next(null);
      return;
    }
    // Assuming the status endpoint is /tasks/{event_id}
    this.http.get(`http://localhost:8000/status/${event_id}`).pipe(
      tap(response => {
        this.taskStatusSubject.next(response);
      }),
      catchError(err => {
        this.logsSubject.next([...this.logsSubject.getValue(), `Error checking status for event ${event_id}: ${err.message}`]);
        this.taskStatusSubject.next(null); // Clear status on error
        return EMPTY;
      })
    ).subscribe();
  }

  cancelImport() {
    if (this.importSubscription) {
      this.importSubscription.unsubscribe();
      this.importSubscription = null;
      this.isImportingSubject.next(false);
      this.logsSubject.next([...this.logsSubject.getValue(), 'Import cancelled by user.']);
    }
  }

  reset() {
    this.cancelImport();
    this.progressSubject.next(0);
    this.logsSubject.next([]);
    this.isImportingSubject.next(false);
    this.importCompleteSubject.next(false);
    this.selectedFileSubject.next(null);
  }
}
