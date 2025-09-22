import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-data-dashboard',
  templateUrl: './data-dashboard.component.html',
  styleUrls: ['./data-dashboard.component.css'],
      standalone: false
})
export class DataDashboardComponent implements OnInit {
  @Input() activeView: 'dashboard' | 'import' = 'dashboard';
  @Output() sourceClicked = new EventEmitter<any>();
  isDarkMode$: Observable<boolean>;
  isAccordionOpen = true;

  dataSourcesCount = 0;
  dataObjectsCount = 0;
  availableSources: any[] = [];

  constructor(
    private themeService: ThemeService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit(): void {
    this.dataService.getDataSources().subscribe(data => {
      this.availableSources = [];
      this.dataSourcesCount = 0;
      this.dataObjectsCount = 0;
      // Handle Weaviate
      if (data && data.datasources && data.datasources.weaviate) {
        const weaviate = data.datasources.weaviate;
        if (weaviate.collections && Array.isArray(weaviate.collections)) {
          weaviate.collections.forEach((col: any) => {
            this.availableSources.push({
              source: 'Weaviate',
              name: col.name,
              description: col.description,
              objects: col.object_count || 0
            });
            this.dataObjectsCount += col.object_count || 0;
          });
          this.dataSourcesCount++;
        }
      }
      // Handle ArangoDB
      if (data && data.datasources && data.datasources.arangodb) {
        const arangodb = data.datasources.arangodb;
        if (arangodb.collections && arangodb.collections.system_collections) {
          arangodb.collections.system_collections.forEach((col: any) => {
            this.availableSources.push({
              source: 'ArangoDB',
              name: col.name,
              type: col.type,
              objects: col.document_count || 0
            });
            this.dataObjectsCount += col.document_count || 0;
          });
          this.dataSourcesCount++;
        }
      }
      this.cdr.detectChanges();
    });
  }

  onSourceClick(source: any): void {
    this.sourceClicked.emit(source);
  }

  toggleAccordion(): void {
    this.isAccordionOpen = !this.isAccordionOpen;
  }
}
