import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css'],
  standalone: false
})
export class DocumentListComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  isDarkMode$: Observable<boolean>;
  documents: any[] = [];

  constructor(private themeService: ThemeService) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit(): void {
    this.documents = [
      { document_id: '00416436-b21d-473f-9fc9-4fec...', document_type: 'meeting_notes', title: 'All Hands Meeting Notes - Septe...', content: 'Meeting led by Nancy Jones and...', author: 'Stacy Mcdonald', created_date: '2024-09-27T17:00:00Z', department: 'hr' },
      { document_id: '00a38ce6-f434-407c-9b44-50f...', document_type: 'report', title: 'Q2 2023 Financial Report', content: 'Quarterly Financial Summary: Q2...', author: 'David Chen', created_date: '2023-07-06T10:00:00Z', department: 'finance' },
      { document_id: '03514b15-1250-49a3-9b90-4426...', document_type: 'contract', title: 'Supplier Agreement with Vivid Ve...', content: 'This Agreement is made on 2025...', author: 'Eleanor Vance', created_date: '2025-02-05T14:15:00Z', department: 'legal' },
      { document_id: '03d38ae4-d149-4608-bd2d-29e...', document_type: 'meeting_notes', title: 'All Hands Meeting Notes - July 2...', content: 'Meeting led by Nancy Jones and...', author: 'Stacy Mcdonald', created_date: '2023-07-28T17:00:00Z', department: 'hr' },
      { document_id: '0815e873-c6d8-42ee-9760-f6f3...', document_type: 'meeting_notes', title: 'All Hands Meeting Notes - May 2...', content: 'Meeting led by Nancy Jones and...', author: 'Stacy Mcdonald', created_date: '2023-05-26T17:00:00Z', department: 'hr' },
      { document_id: '08e0aeba-8092-41d9-b838-df17...', document_type: 'policy', title: 'Supplier Code of Conduct', content: 'This document establishes the ...', author: 'David Chen', created_date: '2025-02-01T09:30:00Z', department: 'operations' },
      { document_id: '0da6f19c-4f2a-44af-a10e-eaa23...', document_type: 'contract', title: 'YouTube Integration: Willow Dean...', content: 'This agreement, dated August 1,...', author: 'Marcus Holloway', created_date: '2025-08-01T16:20:00Z', department: 'marketing' },
      { document_id: '0e7392c7-63fe-4599-9668-c79...', document_type: 'contract', title: 'Influencer Collaboration: Axel Rio...', content: 'This agreement, dated June 5, 2...', author: 'Marcus Holloway', created_date: '2025-06-05T10:00:00Z', department: 'marketing' },
      { document_id: '0f08fc4c-0b89-4b93-b48b-ec7...', document_type: 'contract', title: 'Michael Brown - Employment Det...', content: '**EllyShop Employment Agreeme...', author: 'Stacy Mcdonald', created_date: '2024-10-01T09:00:00Z', department: 'engineering/sup' },
      { document_id: '0fb8d893-0727-4ca2-a3bc-7d6...', document_type: 'contract', title: 'Ben Carter - Employment Details', content: '**EllyShop Employment Agreeme...', author: 'Stacy Mcdonald', created_date: '2024-01-08T09:00:00Z', department: 'legal' },
    ];
  }

  goBack() {
    this.back.emit();
  }
}
