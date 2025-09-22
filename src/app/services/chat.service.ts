import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';
import { environment } from '../../environments/environment';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private mockThreads = [
    {
      _id: 'mock-thread-1',
      name: 'Sample Chat: Getting Started.....',
      usecase_name: 'How to use AI Agent UI',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      _id: 'mock-thread-2',
      name: 'Sample Chat: API Integration',
      usecase_name: 'How to connect your API',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'mock-thread-3',
      name: 'Sample Chat: Configuration',
      usecase_name: 'Customizing your app settings',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  private mockMessages = [
    {
      thread_id: "mock-thread-1",
      message: {
        content: "Hello! Welcome to AI Agent UI. This is mock data to help you test the interface. How can I assist you today?",
        metadata: {
          sender: "ASSISTANT",
          timestamp: new Date().toISOString()
        }
      }
    },
    {
      thread_id: "mock-thread-1",
      message: {
        content: "What features are available in this AI Agent UI?",
        metadata: {
          sender: "USER",
          timestamp: new Date(Date.now() - 60000).toISOString()
        }
      }
    },
    {
      thread_id: "mock-thread-1",
      message: {
        content: "This AI Agent UI includes several powerful features:\n\n• **Chat Interface** - Interactive conversations with AI\n• **Data Dashboard** - Analytics and insights\n• **Settings Panel** - Configuration management\n• **Theme Switcher** - Light/dark mode support\n• **Mock Data Mode** - Testing without real API\n\nAll features are configurable through the config.json file!",
        metadata: {
          sender: "ASSISTANT",
          timestamp: new Date(Date.now() - 30000).toISOString()
        }
      }
    },
    {
      thread_id: "mock-thread-2",
      message: {
        content: "How do I integrate my own API endpoints?",
        metadata: {
          sender: "USER",
          timestamp: new Date(Date.now() - 90000).toISOString()
        }
      }
    },
    {
      thread_id: "mock-thread-2",
      message: {
        content: "You can configure your API endpoints in the config.json file under the 'apiEndpoints' section. Update the chatApiBaseUrl, historyApiUrl, and netqueryApiUrl to point to your backend services.",
        metadata: {
          sender: "ASSISTANT",
          timestamp: new Date(Date.now() - 120000).toISOString()
        }
      }
    }
  ];

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  private get apiEndpoints() {
    return this.configService.getApiEndpoints();
  }

  private get isMockDataEnabled() {
    const config = this.configService.getConfig();
    return config.features?.enableMockData || false;
  }

  async getSuggestions() {
    if (this.isMockDataEnabled) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            suggestions: [
              "How do I configure the AI Agent UI?",
              "What features are available in this app?",
              "How can I customize the branding?",
              "How do I enable different dashboards?",
              "What API endpoints can I configure?"
            ]
          });
        }, 500);
      });
    }
    
    const url = `${this.apiEndpoints.chatApiBaseUrl}/suggestions`;
    return await this.http.get(url);
  }

  async getThreads() {
    if (this.isMockDataEnabled) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ threads: this.mockThreads });
        }, 300);
      });
    }
    
    const url = `${this.apiEndpoints.chatApiBaseUrl}/threads`;
    return await this.http.get(url);
  }

  async saveThread(userInput: string, metadata?: any) {
    if (this.isMockDataEnabled) {
      return new Promise(resolve => {
        setTimeout(() => {
          const newThread = {
            _id: `thread_${Date.now()}`,
            name: userInput,
            usecase_name: "General Chat",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          this.mockThreads.unshift(newThread);
          resolve({ thread: newThread });
        }, 300);
      });
    }

    const payload = {
      "title": userInput,
      "metadata": metadata || {}
    }
    const url = `${this.apiEndpoints.chatApiBaseUrl}/threads`;
    return await this.http.post(url, payload)
  }

  async updateThreadName(threadId: string, threadName: string) {
    if (this.isMockDataEnabled) {
      return new Promise(resolve => {
        setTimeout(() => {
          const thread = this.mockThreads.find(t => t._id === threadId);
          if (thread) {
            thread.name = threadName;
            thread.updated_at = new Date().toISOString();
          }
          resolve({ success: true, thread });
        }, 200);
      });
    }

    const payload = {
      "name": threadName
    }
    const url = `${this.apiEndpoints.chatApiBaseUrl}/threads/${threadId}`;
    return await this.http.put(url, payload)
  }

  async deleteThread(threadId: string) {
    if (this.isMockDataEnabled) {
      return new Promise(resolve => {
        setTimeout(() => {
          const index = this.mockThreads.findIndex(t => t._id === threadId);
          if (index > -1) {
            this.mockThreads.splice(index, 1);
          }
          resolve({ success: true });
        }, 200);
      });
    }

    const url = `${this.apiEndpoints.chatApiBaseUrl}/threads/${threadId}`;
    return await this.http.delete(url)
  }

  async getChatByThreadId(threadId: string) {
    if (this.isMockDataEnabled) {
      return new Promise(resolve => {
        setTimeout(() => {
          const threadMessages = this.mockMessages.filter(m => m.thread_id === threadId);
          resolve({ messages: threadMessages });
        }, 300);
      });
    }

    const url = `${this.apiEndpoints.chatApiBaseUrl}/threads/${threadId}/messages`;
    return await this.http.get(url)
  }

  async saveChat(threadId: string, message: string) {
    if (this.isMockDataEnabled) {
      return new Promise(resolve => {
        setTimeout(() => {
          const newMessage = {
            thread_id: threadId,
            message: {
              content: message,
              metadata: {
                sender: "USER",
                timestamp: new Date().toISOString()
              }
            }
          };
          this.mockMessages.push(newMessage);
          resolve({ message: newMessage });
        }, 200);
      });
    }

    const payload = {
      "thread_id": threadId,
      "message": message
    }
    const url = `${this.apiEndpoints.chatApiBaseUrl}/threads/${threadId}/messages`;
    return await this.http.post(url, payload)
  }

  async saveChatFeedback(threadId: string, messageId: string, message: string) {
    const payload = {
      "vote": true,
      "comment": "This is what i expected",
      "reason": "CORRECT"
    }
    const url = `${this.apiEndpoints.chatApiBaseUrl}/threads/${threadId}/messages/${messageId}/feedback`;
    return await this.http.post(url, payload)
  }

  getHistory(): Observable<any> {
    const url = this.apiEndpoints.historyApiUrl;
    const headers = {
      'Content-Type': 'application/json'
    };
    return this.http.get(url, { headers: headers });
  }

  sendMessageToNetquery(message: string): Observable<any> {
    if (this.isMockDataEnabled) {
      return new Observable(observer => {
        // Simulate streaming response for mock data
        const mockResponses = [
          "Processing your query using mock data...",
          "Searching through available resources...",
          "Here's a sample response for testing: ",
          `Your query "${message}" has been processed. `,
          "This demonstrates the AI Agent UI's streaming capability with mock data. ",
          "All features are working correctly in mock mode!"
        ];
        
        let index = 0;
        const interval = setInterval(() => {
          if (index < mockResponses.length) {
            observer.next(JSON.stringify({ result: mockResponses[index] }));
            index++;
          } else {
            clearInterval(interval);
            observer.complete();
          }
        }, 800);
        
        return () => clearInterval(interval);
      });
    }

    const url = this.apiEndpoints.netqueryApiUrl; // Same API endpoint for both streaming and normal
    
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
