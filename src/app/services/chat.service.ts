import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  baseUrl: string = environment.chatApiBaseUrl;
  netqueryUrl: string = environment.netqueryApiUrl;
  historyUrl: string = environment.historyApiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  async getSuggestions() {
    const url = `${this.baseUrl}/suggestions`;
    return await this.http.get(url)
  }

  async getThreads() {
    const url = `${this.baseUrl}/threads`;
    return await this.http.get(url)
  }

  async saveThread(userInput: string, metadata?: any) {
    const payload = {
      "title": userInput,
      "metadata": metadata || {}
    }
    const url = `${this.baseUrl}/threads`;
    return await this.http.post(url, payload)
  }

  async updateThreadName(threadId: string, threadName: string) {
    const payload = {
      "name": threadName
    }
    const url = `${this.baseUrl}/threads/${threadId}`;
    return await this.http.put(url, payload)
  }

  async deleteThread(threadId: string) {
    const url = `${this.baseUrl}/threads/${threadId}`;
    return await this.http.delete(url)
  }

  async getChatByThreadId(threadId: string) {
    const url = `${this.baseUrl}/threads/${threadId}/messages`;
    return await this.http.get(url)
  }

  async saveChat(threadId: string, message: string) {
    const payload = {
      "thread_id": threadId,
      "message": message
    }
    const url = `${this.baseUrl}/threads/${threadId}/messages`;
    return await this.http.post(url, payload)
  }

  async saveChatFeedback(threadId: string, messageId: string, message: string) {
    const payload = {
      "vote": true,
      "comment": "This is what i expected",
      "reason": "CORRECT"
    }
    const url = `${this.baseUrl}/threads/${threadId}/messages/${messageId}/feedback`;
    return await this.http.post(url, payload)
  }

  getHistory(): Observable<any> {
    const url = this.historyUrl;
    const headers = {
      'Content-Type': 'application/json'
    };
    return this.http.get(url, { headers: headers });
  }

  sendMessageToNetquery(message: string): Observable<any> {
    const url = this.netqueryUrl; // Same API endpoint for both streaming and normal
    
    const payload = {
      "tenant_id": "NOVUS_RAG",
      "query": message,
      "debug": true,
      "top_k": 3,
      "synthesize": true
    };

    const token = sessionStorage.getItem(environment.authTokenKey);
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Mock: if message is 'mockfile', emit a single message with both text and file info
    if (message === 'mockfile') {
      return new Observable(observer => {
        observer.next(JSON.stringify({
          type: 'file',
          filename: 'sample_report.txt',
          content: 'U2FtcGxlIGZpbGUgY29udGVudCBmb3IgZG93bmxvYWQgdGVzdGluZy4=',
          filetype: 'text/plain',
          result: 'Here is your requested report. Please download the file below.'
        }));
        observer.complete();
      });
    }

    return new Observable(observer => {
      const ctrl = new AbortController();
      let retries = 1;
      let hasReceivedData = false;

      fetchEventSource(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: ctrl.signal,
        onopen: async (response) => {
          console.log('---response---', response);
          
          if (response.status === 401 || response.status === 403) {
            observer.error(new Error(`Authorization failed with status ${response.status}`));
            ctrl.abort();
            return;
          }

          // Check response content type to determine if it's streaming or normal
          const contentType = response.headers.get('content-type');
          console.log('Content-Type:', contentType);
          
          if (response.ok) {
            // If it's a streaming response, continue with fetchEventSource
            if (contentType?.includes(EventStreamContentType)) {
              console.log('Detected streaming response');
              return; // Continue with streaming
            }
            
            // If it's a normal JSON response, handle it differently
            if (contentType?.includes('application/json')) {
              console.log('Detected normal JSON response');
              ctrl.abort(); // Stop fetchEventSource
              
              // Make a regular HTTP call to get the JSON response
              this.http.post(url, payload, { headers: headers }).subscribe({
                next: (response: any) => {
                  // Emit the complete response as a JSON string for consistency
                  observer.next(JSON.stringify(response));
                  observer.complete();
                },
                error: (error: any) => {
                  observer.error(error);
                }
              });
              return;
            }
          }

          throw new Error(`Failed to connect. Status: ${response.status}, Content-Type: '${contentType}'`);
        },
        onmessage: (ev) => {
          hasReceivedData = true;
          if (ev.event === 'close') {
            observer.complete();
          } else {
            // Emit streaming chunks
            observer.next(ev.data);
          }
        },
        onclose: () => {
          observer.complete();
        },
        onerror: (err) => {
          console.log('fetchEventSource error:', err);
          
          // If we haven't received any streaming data and it's the first try,
          // the API might be returning normal JSON instead of streaming
          if (!hasReceivedData && retries > 0) {
            retries--;
            ctrl.abort();
            
            console.log('Trying normal HTTP request as fallback...');
            this.http.post(url, payload, { headers: headers }).subscribe({
              next: (response: any) => {
                observer.next(JSON.stringify(response));
                observer.complete();
              },
              error: (error: any) => {
                observer.error(error);
              }
            });
            return;
          }
          
          observer.error(err);
          throw err;
        }
      });

      return () => ctrl.abort();
    });
  }

  private handleNormalResponse(url: string, payload: any, headers: any, observer: any): void {
    this.http.post(url, payload, { headers: headers }).subscribe({
      next: (response: any) => {
        // Convert normal response to streaming format for consistency
        observer.next(JSON.stringify(response));
        observer.complete();
      },
      error: (error: any) => {
        observer.error(error);
      }
    });
  }
}
