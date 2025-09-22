import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, interval, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { ProcessingEvent, EventDetails, StatusCounts } from '../../models/status.models';
import { ThemeService } from '../../services/theme.service';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'app-status-dashboard',
  templateUrl: './status-dashboard.component.html',
  styleUrls: ['./status-dashboard.component.css'],
  standalone: false
})
export class StatusDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Theme support
  isDarkMode$!: Observable<boolean>;
  
  // Observable data
  events$ = new BehaviorSubject<ProcessingEvent[]>([]);
  statusCounts$ = new BehaviorSubject<StatusCounts>({
    completed: 0,
    in_progress: 0,
    failed: 0,
    pending: 0
  });
  
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  lastUpdated$ = new BehaviorSubject<Date | null>(null);
  
  // Auto-refresh settings
  autoRefresh = true;
  autoRefreshInterval = 60000; // 60 seconds

  // Event details cache
  eventDetailsCache = new Map<string, EventDetails>();

  // Stage display names
  readonly STAGE_NAMES: { [key: string]: string } = {
    'upload_received': 'Upload',
    'file_stored': 'Storage',
    'metadata_extracted': 'Metadata',
    'event_published': 'Queue',
    'pdf_processing_started': 'PDF Start',
    'pdf_processing_completed': 'PDF Done',
    'chunking_started': 'Chunk Start',
    'chunking_completed': 'Chunk Done',
    'embedding_started': 'Embed Start',
    'embedding_completed': 'Embed Done',
    'vector_store_started': 'Vector Start',
    'vector_store_completed': 'Vector Done',
    'graph_update_started': 'Graph Start',
    'graph_update_completed': 'Graph Done',
    'processing_completed': 'Complete',
    'processing_failed': 'Failed'
  };

  // Add a custom comparator to preserve original order
  originalOrder = () => 0;

  constructor(private statusService: StatusService, private themeService: ThemeService) {}

  ngOnInit(): void {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.startAutoRefresh();
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshData(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this.statusService.fetchEvents()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.error$.next(`Failed to load data: ${error.message}`);
          this.loading$.next(false);
          throw error;
        })
      )
      .subscribe({
        next: (data) => {
          const events = data.events || [];
          this.events$.next(events);
          this.updateStatusCounts(events);
          this.loadEventDetails(events.slice(0, 10)); // Load details for recent events
          this.lastUpdated$.next(new Date());
          this.loading$.next(false);
        },
        error: (error) => {
          console.error('Error fetching events:', error);
          this.loading$.next(false);
        }
      });
  }

  private updateStatusCounts(events: ProcessingEvent[]): void {
    const counts: StatusCounts = {
      completed: 0,
      in_progress: 0,
      failed: 0,
      pending: 0
    };

    events.forEach(event => {
      const status = event.overall_status;
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    this.statusCounts$.next(counts);
  }

  private loadEventDetails(events: ProcessingEvent[]): void {
    events.forEach(event => {
      if (!this.eventDetailsCache.has(event.event_id)) {
        this.statusService.fetchEventDetails(event.event_id)
          .pipe(
            takeUntil(this.destroy$),
            catchError(error => {
              console.error(`Failed to fetch details for event ${event.event_id}:`, error);
              return [];
            })
          )
          .subscribe(details => {
            if (details) {
              this.eventDetailsCache.set(event.event_id, details);
            }
          });
      }
    });
  }

  getEventDetails(eventId: string): EventDetails | null {
    return this.eventDetailsCache.get(eventId) || null;
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  private startAutoRefresh(): void {
    if (this.autoRefresh) {
      interval(this.autoRefreshInterval)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.refreshData();
        });
    }
  }

  getStageStatus(eventId: string, stage: string): string {
    const details = this.getEventDetails(eventId);
    if (!details || !details.timeline) {
      return 'pending';
    }
    
    const stageData = details.timeline.find(t => t.stage === stage);
    return stageData ? stageData.status : 'pending';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString();
  }
}
