import { Component, computed, inject, ViewChild, ElementRef, ChangeDetectorRef, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatService } from '../../services/chat.service';
import { ThemeService } from '../../services/theme.service';
import { ConfigService } from '../../services/config.service';
import { Observable } from 'rxjs';
import { marked } from 'marked';

@Component({
  selector: 'incident-query',
  templateUrl: './incident-query.component.html',
  styleUrl: './incident-query.component.css',
    standalone: false
})
export class incidentQueryComponent implements AfterViewChecked, OnDestroy {
  public username: string | null = sessionStorage.getItem('username')?.split('@')[0] || "Test";
  activeTab: string = 'chat';
  activeDataView: 'dashboard' | 'import' | 'status' = 'dashboard';

  selectTab(tab: string) {
    // Check if the tab is enabled before switching
    if (tab === 'data' && !this.enableDataDashboard) {
      console.warn('Data dashboard is disabled in configuration');
      this.activeTab = 'chat';
      return;
    }
    if (tab === 'settings' && !this.enableSettingsDashboard) {
      console.warn('Settings dashboard is disabled in configuration');
      this.activeTab = 'chat';
      return;
    }
    this.activeTab = tab;
  }

  selectDataView(view: 'dashboard' | 'import' | 'status') {
    this.activeDataView = view;
  }

  showDocuments() {
    this.activeTab = 'documents';
  }

  showDataDashboard() {
    this.activeTab = 'data';
  }

  isDarkMode$: Observable<boolean>;
  private shouldAutoScroll = true;
  private messagesLength = 0;

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  activeIndex: any = {};
  threads: any[] = [];
  groupedThreads: { [key: string]: any[] } = {};
  isNewThread: boolean = false;
  selectedThread: any = {};
  textareaValue = '';
  maxCharsPerLineInThreadInput = 50;
  baseHeight = 50.5;
  maxHeight = 200;
  isFocused = false;
  messages: any[] = [];
  threadMessages: { [key: string]: any[] } = {};
  suggestions: string[] = [];
  newThreadCreated: boolean = false;
  loadingSend: boolean = false;
  // actionConfigs: { [threadId: string]: any } = {};
  // modal = inject(any);
  config = computed((): any => ({}));
  // shellConfig = computed((): any => ({}));
  // headerConfig = computed((): any => ({ heading: 'My AI Assistant' }));

  positiveOptions: any = ['Correct', 'Helpful', 'Other'];
  negativeOptions: any = ['Incorrect', 'Not helpful', 'Unsafe', 'Other'];
  feedbackMessageId: string = "";
  feedbackType: string = "";

  feedbackForm = new FormGroup({
    comment: new FormControl(''),
    reason: new FormControl([], [Validators.required]),
  });

  // Properties to track new messages
  private previousMessagesLength = 0;
  private newMessageTimestamp = 0;

  // Feature flags from config
  enableDataDashboard: boolean = false;
  enableSettingsDashboard: boolean = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private chatService: ChatService,
    private themeService: ThemeService,
    private configService: ConfigService,
    private zone: NgZone
  ) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    
    // Load feature flags from config
    const config = this.configService.getConfig();
    this.enableDataDashboard = config.features?.enableDataDashboard || false;
    this.enableSettingsDashboard = config.features?.enableSettingsDashboard || false;
    
    // Debug logging
    console.log('🔧 Feature flags loaded:', {
      enableDataDashboard: this.enableDataDashboard,
      enableSettingsDashboard: this.enableSettingsDashboard,
      fullConfig: config
    });
  }

  ngOnInit() {
    this.isNewThread = false;
    this.messages = [];
    this.messagesLength = this.messages.length;

    this.loadChatHistory();
    this.loadSuggestions();

    let textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = this.baseHeight + 'px';
    }

    // Ensure scroll to bottom after initial load
    setTimeout(() => {
      if (!this.isNewThread && this.messages.length > 0) {
        this.forceScrollToBottom();
      }
    }, 500);
  }

  loadChatHistory() {
    // Check if mock data is enabled
    const config = this.configService.getConfig();
    if (config.features?.enableMockData) {
      console.log('🎭 Loading mock chat data...');
      this.loadMockChatData();
      return;
    }

    // Original API call for real data
    const mockResponse = {
      "items": [
        {
          "id": "1",
          "query_message": "show ip interface brief",
          "response_message": "Interface IP-Address OK? Method Status Protocol Vlan",
          "received_timestamp": "2025-09-09T12:35:45.123Z",
          "completion_timestamp": "2025-09-09T12:35:48.456Z",
          "agent_type": "CLI Agent"
        },
        {
          "id": "2",
          "query_message": "what is the status of bgp?",
          "response_message": "BGP is running",
          "received_timestamp": "2025-09-08T10:20:30.789Z",
          "completion_timestamp": "2025-09-08T10:20:33.987Z",
          "agent_type": "BGP Agent"
        },
        {
          "id": "3",
          "query_message": "show version",
          "response_message": "Cisco IOS XE Software, Version 17.03.01a",
          "received_timestamp": "2025-08-10T15:00:00.000Z",
          "completion_timestamp": "2025-08-10T15:00:02.000Z",
          "agent_type": "System Agent"
        }
      ]
    };

    // this.processHistoryResponse(mockResponse);
    this.chatService.getHistory().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.history)) {
          this.processHistoryResponse(response);
        } else {
          // Handle empty or error response
          this.threads = [];
          this.threadMessages = {};
          console.error('No history found or API error:', response?.detail || response);
        }
      },
      error: (err: any) => {
        console.error('API failed error', err);
        this.threads = [];
        this.threadMessages = {};
      }
    });
  }

  async loadMockChatData() {
    try {
      // Load mock threads
      const threadsResponse = await this.chatService.getThreads() as any;
      if (threadsResponse && threadsResponse.threads) {
        this.threads = threadsResponse.threads;
        console.log('🎭 Loaded mock threads:', this.threads);

        // Load messages for each thread
        this.threadMessages = {};
        for (const thread of this.threads) {
          const messagesResponse = await this.chatService.getChatByThreadId(thread._id) as any;
          console.log(`🎭 Messages response for thread ${thread._id}:`, messagesResponse);
          
          if (messagesResponse && messagesResponse.messages) {
            // Convert mock messages to the expected format
            this.threadMessages[thread._id] = messagesResponse.messages.map((msgData: any) => {
              const convertedMessage = {
                _id: 'msg_' + Date.now() + '_' + Math.random(),
                createdAt: msgData.message.metadata.timestamp,
                message: {
                  metadata: { 
                    sender: msgData.message.metadata.sender === 'ASSISTANT' ? 'SYSTEM' : msgData.message.metadata.sender 
                  },
                  output: msgData.message.content,
                  safeOutput: this.createSafeHtml(msgData.message.content)
                }
              };
              console.log(`🎭 Converted message:`, convertedMessage);
              return convertedMessage;
            });
          }
        }

        console.log('🎭 Loaded mock messages:', this.threadMessages);

        // Group threads and select the first one
        this.groupThreadsByDate();
        
        if (this.threads.length > 0) {
          this.selectThread(this.threads[0]);
        } else {
          this.newThread();
        }
      }
    } catch (error) {
      console.error('Error loading mock chat data:', error);
      // Fallback to empty state
      this.threads = [];
      this.threadMessages = {};
      this.newThread();
    }
  }

  processHistoryResponse(response: any) {
      const today = new Date();
      const todayMessages: any[] = [];
      const todayThreadId = 'today_thread';
      const threadsByDate: { [key: string]: any } = {};

      this.threadMessages = {};

      response.history.forEach((item: any) => {
        const itemDate = new Date(item.timestamp);
        const queryMessage = {
          _id: 'msg_' + item.query_id + '_q',
          createdAt:  item.timestamp,
          message: {
            metadata: { sender: 'USER' },
            output: item.query_text,
            safeOutput: this.createSafeHtml(item.response_data.query)
          }
        };
        const responseMessage = this.createResponseMessage(item);

        if (this.isSameDay(itemDate, today)) {
          todayMessages.push(queryMessage, responseMessage);
        } else {
          const dateString = itemDate.toISOString().split('T')[0];
          if (!threadsByDate[dateString]) {
            // Format date for display (e.g., "Sep 21, 2025")
            const formattedDate = itemDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
            threadsByDate[dateString] = {
              _id: 'thread_' + dateString,
              name: formattedDate,
              usecase_name: "System Agent",
              createdAt: item.timestamp,
              messages: []
            };
          }
          threadsByDate[dateString].messages.push(queryMessage, responseMessage);
        }
      });

      this.threads = [];
      if (todayMessages.length > 0) {
        todayMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        this.threads.push({
          _id: todayThreadId,
          name: "Today's Conversation",
          usecase_name: 'Recent Chats',
          createdAt: Date.now()
        });
        this.threadMessages[todayThreadId] = todayMessages;
      }

      const otherThreads = Object.values(threadsByDate).map((threadData: any) => {
        threadData.messages.sort((a:any, b:any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        this.threadMessages[threadData._id] = threadData.messages;
        return {
          _id: threadData._id,
          name: threadData.name,
          usecase_name: threadData.usecase_name,
          createdAt: threadData.createdAt
        };
      });

      this.threads = this.threads.concat(otherThreads);

      this.groupThreadsByDate();

      if (this.threads.length > 0) {
        this.selectThread(this.threads[0]);
      } else {
        this.newThread();
      }
  }

  ngAfterViewChecked() {
    if (this.messages.length !== this.messagesLength) {
      this.scrollToBottom();
      this.messagesLength = this.messages.length;
      
      // For new threads or when messages are first loaded, always scroll to bottom
      if (this.messages.length > 0 && this.messagesLength === 0) {
        setTimeout(() => {
          this.forceScrollToBottom();
        }, 50);
      }
    }
  }


  ngOnDestroy() {
    // if (this.observer) {
    //   this.observer.disconnect();
    // }
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 50;
    this.shouldAutoScroll = isNearBottom;
  }

  scrollToBottom(): void {
    if (this.shouldAutoScroll) {
      try {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error(err);
      }
    }
  }

  forceScrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error(err);
    }
  }

  openDeleteModal(thread: any): void {
    // TODO: Implement with Bootstrap modal
    console.log('Delete modal for thread:', thread);
    // const modalRef = this.modal.open(ModalTemplateComponent, {
    //   data: { type: 'Delete Thread', thread: thread, heading: 'Delete this Thread?' },
    //   closeOnBackdropClick: true, size: 'medium', panelClass: 'example-class', canClose: () => true
    // });

    // modalRef.afterClosed().subscribe((result: any) => {
    //   if (result?.type === 'delete') {
    //     this.deleteThread(result.threadId);
    //   }
    // });
  }

  openRenameUsecaseModal(thread: any): void {
    // TODO: Implement with Bootstrap modal
    console.log('Rename modal for thread:', thread);
    // const modalRef = this.modal.open(ModalTemplateComponent, {
    //   data: { type: "Rename Thread", thread: thread, heading: 'Rename this Thread?' },
    //   closeOnBackdropClick: true, size: 'medium', panelClass: 'example-class', canClose: () => true
    // });

    // modalRef.afterClosed().subscribe((result: any) => {
    //   if (result?.type === 'rename') {
    //     this.updateThreadName(result.threadId, result.newName);
    //   }
    // });
  }

  createActionConfig(thread: any): any {
    return {
      id: 'action-menu', label: 'action menu', icon: 'dots-three', iconOnly: true,
      dropdownItems: [
        { label: 'Rename thread', value: 'edit', icon: 'pencil-simple', onTrigger: () => this.openRenameUsecaseModal(thread) },
        { label: 'Delete', value: 'delete', icon: 'trash-simple', destructive: true, onTrigger: () => this.openDeleteModal(thread) }
      ]
    };
  }

  groupThreadsByDate() {
    const today = new Date();
    const prior30Days = new Date(new Date().setDate(today.getDate() - 30));

    this.groupedThreads = { 'Today': [], 'Previous 30 days': [], 'Older': [] };

    this.threads.forEach((thread: any) => {
      // this.actionConfigs[thread._id] = this.createActionConfig(thread);
      const threadDate = new Date(thread.createdAt);
      if (this.isSameDay(threadDate, today)) {
        this.groupedThreads['Today'].push(thread);
      } else if (threadDate >= prior30Days) {
        this.groupedThreads['Previous 30 days'].push(thread);
      } else {
        this.groupedThreads['Older'].push(thread);
      }
    });
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  newThread() {
    this.isNewThread = true;
    this.messages = [];
    this.selectedThread = {};
    this.activeIndex = {};
    this.textareaValue = '';
  }

  selectThread(thread: any) {
    this.isNewThread = false;
    this.activeIndex = { [thread._id]: true };
    this.selectedThread = thread;
    this.previousMessagesLength = 0; // Reset tracking when switching threads
    this.messages = this.threadMessages[thread._id] || [];
    
    console.log(`🎯 Selected thread: ${thread._id}`, thread);
    console.log(`🎯 Thread messages:`, this.threadMessages[thread._id]);
    console.log(`🎯 Current messages array:`, this.messages);
    
    this.updateMessageTracking();
    this.shouldAutoScroll = true;
    this.cdRef.detectChanges();
    this.textareaValue = '';
    
    // Force scroll to bottom when selecting a thread
    setTimeout(() => {
      this.forceScrollToBottom();
    }, 100);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    const newHeight = Math.max(textarea.scrollHeight, this.baseHeight);
    textarea.style.height = `${Math.min(newHeight, this.maxHeight)}px`;
  }
 
  async sendMessage() {
    if (!this.textareaValue.trim()) return;

    this.loadingSend = true;
    this.shouldAutoScroll = true;
    const messageText = this.textareaValue.trim();

    const userMessage = {
      _id: 'msg_' + new Date().getTime(),
      createdAt: Date.now(),
      message: { metadata: { sender: 'USER' }, output: messageText, safeOutput: this.createSafeHtml(messageText) }
    };

    let currentThreadId = this.selectedThread._id;

    if (this.isNewThread) {
      // Save the new thread using chat service (handles mock data automatically)
      const threadTitle = this.textareaValue.trim().substring(0, 30);
      try {
        const response = await this.chatService.saveThread(threadTitle) as any;
        if (response && response.thread) {
          const newThread = response.thread;
          this.threads.unshift(newThread);
          this.groupThreadsByDate();
          this.threadMessages[newThread._id] = [];
          this.selectThread(newThread);
          this.isNewThread = false;
          currentThreadId = newThread._id;
        }
      } catch (error) {
        console.error('Error saving new thread:', error);
        // Fallback to local thread creation
        const newThreadId = 'thread_' + new Date().getTime();
        const newThread = {
          _id: newThreadId,
          name: threadTitle,
          usecase_name: 'New Conversation',
          createdAt: Date.now(),
          updated_at: Date.now()
        };
        this.threads.unshift(newThread);
        this.groupThreadsByDate();
        this.threadMessages[newThreadId] = [];
        this.selectThread(newThread);
        this.isNewThread = false;
        currentThreadId = newThreadId;
      }
    }

    // Defensive: Ensure threadMessages[currentThreadId] is initialized
    if (!this.threadMessages[currentThreadId]) {
      this.threadMessages[currentThreadId] = [];
    }
    this.threadMessages[currentThreadId].push(userMessage);

    // Save the user message using chat service (handles mock data automatically)
    try {
      await this.chatService.saveChat(currentThreadId, messageText);
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    const loadingMessageId = 'ai_loading_' + new Date().getTime();
    const loadingMessage = {
      _id: loadingMessageId,
      createdAt: Date.now(),
      message: { metadata: { sender: 'SYSTEM' }, output: '', safeOutput: this.createSafeHtml('') },
      isLoading: true
    };
    this.threadMessages[currentThreadId].push(loadingMessage);

    this.messages = [...this.threadMessages[currentThreadId]];
    this.updateMessageTracking();
    this.textareaValue = '';
    this.cdRef.detectChanges();

    const loadingIndex = this.threadMessages[currentThreadId].findIndex(m => m._id === loadingMessageId);
    let accumulatedResponse = '';

    this.chatService.sendMessageToNetquery(messageText).subscribe({
      next: (chunk: any) => {
        this.zone.run(() => {
          if (loadingIndex === -1) return;

          try {
            const parsedData = JSON.parse(chunk);
            let messageUpdate: any = null;
            if (parsedData.chunk) {
              // Streaming chunk - accumulate response
              accumulatedResponse += parsedData.chunk;
              messageUpdate = {
                ...this.threadMessages[currentThreadId][loadingIndex],
                message: {
                  ...this.threadMessages[currentThreadId][loadingIndex].message,
                  output: accumulatedResponse,
                  safeOutput: this.createSafeHtml(accumulatedResponse)
                },
                isLoading: true
              };
            } 
            else if (parsedData.synthesis || parsedData.message || parsedData.result) {
              // Complete response - display final result
              const responseText = parsedData.synthesis || parsedData.message || parsedData.result || 'No response received';
              messageUpdate = {
                _id: loadingMessageId,
                createdAt: Date.now(),
                message: {
                  metadata: { sender: 'SYSTEM' },
                  output: responseText,
                  safeOutput: this.createSafeHtml(responseText)
                },
                isLoading: false
              };
              this.loadingSend = false;
            }

            // Update UI if we have a message update
            if (messageUpdate) {
              this.threadMessages[currentThreadId][loadingIndex] = messageUpdate;
              this.messages = [...this.threadMessages[currentThreadId]];
              this.updateMessageTracking();
              this.cdRef.detectChanges();
              this.scrollToBottom();
            }
          } catch (error) {
            // If it's not JSON, treat as plain text
            console.log('Non-JSON chunk received:', chunk);
          }
        });
      },
      error: (error: any) => {
        this.zone.run(() => {
          console.error('API call failed', error);
          if (loadingIndex !== -1) {
            const errorResponse = {
              _id: loadingMessageId,
              createdAt: Date.now(),
              message: { metadata: { sender: 'SYSTEM' }, output: 'Error connecting to the server.', safeOutput: this.createSafeHtml('Error connecting to the server.') },
              isLoading: false
            };
            this.threadMessages[currentThreadId][loadingIndex] = errorResponse;
            this.messages = [...this.threadMessages[currentThreadId]];
            this.updateMessageTracking();
          }
          this.loadingSend = false;
        });
      },
      complete: () => {
        this.zone.run(() => {
          if (loadingIndex !== -1) {
            const finalMessage = {
              ...this.threadMessages[currentThreadId][loadingIndex],
              isLoading: false
            };
            this.threadMessages[currentThreadId][loadingIndex] = finalMessage;
            this.messages = [...this.threadMessages[currentThreadId]];
            this.updateMessageTracking();
            this.cdRef.detectChanges();
          }
          this.loadingSend = false;
          this.scrollToBottom();
        });
      }
    });
  }
  private createSafeHtml(text: string): SafeHtml {
    if (!text) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    // Detect markdown (simple heuristic: headers, lists, code, etc.)
    const isMarkdown = /(^#|^>|^\*|^\-|^\d+\.)/m.test(text) || text.includes('```');
    let html: string;
    if (isMarkdown) {
      html = marked.parse(text) as string;
    } else {
      html = text.replace(/\n/g, '<br>');
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  downloadFile(filename: string, content: string) {
    // Decode base64 content
    const byteCharacters = atob(content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }


  async deleteThread(threadId: string) {
    console.log('Deleting thread:', threadId);
    // Placeholder for delete logic
  }

  async updateThreadName(threadId: string, threadName: string) {
    console.log('Updating thread:', threadId, 'to', threadName);
    // Placeholder for update logic
  }

  actionTriggered(event: { id: string }) {
    console.log('Action triggered:', event.id);
  }

  openFeedback(feedbackType: string, thread: any) {
    this.feedbackMessageId = thread._id;
    this.feedbackType = feedbackType;
  }

  closeFeedback() {
    this.feedbackMessageId = "";
    this.feedbackType = "";
  }

  submitFeedback(thread: any) { }

  editMessage(message: any) {
    this.textareaValue = message.message.output;
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => console.log('Text copied to clipboard'),
      err => console.error('Failed to copy text: ', err)
    );
  }

  private createResponseMessage(item: any): any {
    let responseMessage;
    try {
      // It might be a stringified JSON with file info
      const parsedData = item['agent_response'] ? item['agent_response'] : JSON.parse(item['response_message']);
      if (parsedData && parsedData.filename && parsedData.content) {
        responseMessage = {
          _id: 'msg_' + item.id + '_r',
          createdAt: item.completion_timestamp,
          message: {
            metadata: { sender: 'SYSTEM', type: 'file' },
            output: parsedData['message'] || parsedData['filename'],
            content: parsedData['content'],
            filename: parsedData['filename'],
            filetype: parsedData['filetype'],
            safeOutput: this.createSafeHtml(item['response_message'] || parsedData['filename'])
          },
          isLoading: false
        };
      } else {
        // It's a JSON but not a file message, treat as plain text for history
        responseMessage = {
          _id: 'msg_' + item.id + '_r',
          createdAt: item.timestamp,
          message: {
            metadata: { sender: 'SYSTEM' },
            output: item.response_message,
            safeOutput: this.createSafeHtml(item.response_message)
          }
        };
      }
    } catch (error) {
      console.log('createResponseMessage Error: parsing response message as JSON:', error);
      // If parsing fails, it's just a regular string message
      responseMessage = {
        _id: 'msg_' + item.query_id + '_r',
        createdAt: item.timestamp,
        message: {
          metadata: { sender: 'SYSTEM' },
          output: item.response_data.synthesis || item['response_message'],
          safeOutput: this.createSafeHtml(item.response_data.synthesis || item['response_message'])
        }
      };
    }
    return responseMessage;
  }

  // Track by function for ngFor to improve performance
  trackByMessageId(index: number, message: any): any {
    return message._id || message.message?.id || index;
  }

  // Check if a message is new (recently added)
  isNewMessage(index: number): boolean {
    // Only consider last 2 messages as "new" to avoid animating all messages
    return index >= Math.max(0, this.messages.length - 2) && 
           index >= this.previousMessagesLength;
  }

  // Check if a message is currently streaming (new and within animation window)
  isMessageStreaming(index: number): boolean {
    return this.isNewMessage(index) && 
           (Date.now() - this.newMessageTimestamp) < 2000; // 2 seconds streaming animation
  }

  // Check if a message animation is complete
  isMessageComplete(index: number): boolean {
    return this.isNewMessage(index) && 
           (Date.now() - this.newMessageTimestamp) >= 2000; // After 2 seconds, show complete state
  }

  // Update message tracking when messages change
  private updateMessageTracking(): void {
    if (this.messages.length > this.previousMessagesLength) {
      this.previousMessagesLength = this.messages.length;
      this.newMessageTimestamp = Date.now();
      
      // Force change detection immediately
      setTimeout(() => {
        // This will trigger the view update for streaming animation
        console.log('Animation trigger: streaming phase');
      }, 0);
      
      // Trigger change detection to transition from streaming to complete
      setTimeout(() => {
        // This will trigger the transition from streaming to complete
        console.log('Animation trigger: complete phase');
      }, 2000); // Match the streaming duration
      
      // Reset the "new" status after animation completes
      setTimeout(() => {
        this.previousMessagesLength = this.messages.length;
        console.log('Animation trigger: reset phase');
      }, 3000); // 3 seconds for animation to complete
    }
  }

  async loadSuggestions() {
    try {
      const response = await this.chatService.getSuggestions() as any;
      if (response && response.suggestions) {
        this.suggestions = response.suggestions;
        console.log('📝 Loaded suggestions:', this.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      this.suggestions = [];
    }
  }

  // Test method to verify mock data loading
  testMockDataLoading() {
    console.log('🧪 Testing mock data loading...');
    console.log('🧪 Current threads:', this.threads);
    console.log('🧪 Current threadMessages:', this.threadMessages);
    console.log('🧪 Current messages array:', this.messages);
    console.log('🧪 Selected thread:', this.selectedThread);
    
    // Force a message refresh
    if (this.selectedThread._id && this.threadMessages[this.selectedThread._id]) {
      this.messages = [...this.threadMessages[this.selectedThread._id]];
      this.cdRef.detectChanges();
      console.log('🧪 Refreshed messages:', this.messages);
    }
  }
}
