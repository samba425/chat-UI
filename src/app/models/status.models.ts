export interface ProcessingEvent {
  event_id: string;
  overall_status: 'completed' | 'in_progress' | 'failed' | 'pending';
  current_stage: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  last_error?: string;
}

export interface EventDetails {
  timeline: Array<{
    stage: string;
    status: 'completed' | 'in_progress' | 'failed' | 'pending';
    timestamp?: string;
  }>;
}

export interface StatusCounts {
  completed: number;
  in_progress: number;
  failed: number;
  pending: number;
}

export interface StatusResponse {
  events: ProcessingEvent[];
}
