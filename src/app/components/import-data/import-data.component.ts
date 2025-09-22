import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { ImportService } from '../../services/import.service';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.css'],
  standalone:false
})
export class ImportDataComponent implements OnInit, OnDestroy {
  importForm: FormGroup;
  isDragOver = false;
  isDarkMode$: Observable<boolean>;

  progress$: Observable<number>;
  logs$: Observable<string[]>;
  isImporting$: Observable<boolean>;
  importComplete$: Observable<boolean>;
  selectedFile$: Observable<File | null>;
  taskId$: Observable<string | null>;
  taskStatus$: Observable<any | null>;

  private subscriptions = new Subscription();
  statusTaskId: string = '';

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    public importService: ImportService
  ) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.importForm = this.fb.group({
      chunkSize: [1024, Validators.required],
    });

    this.progress$ = this.importService.progress$;
    this.logs$ = this.importService.logs$;
    this.isImporting$ = this.importService.isImporting$;
    this.importComplete$ = this.importService.importComplete$;
    this.selectedFile$ = this.importService.selectedFile$;
    this.taskId$ = this.importService.taskId$;
    this.taskStatus$ = this.importService.taskStatus$;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.taskId$.subscribe(taskId => {
        if (taskId) {
          this.statusTaskId = taskId;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.importService.selectFile(files[0]);
    }
  }

  onImport() {
    this.importService.startImport(this.importForm.value.chunkSize);
  }

  checkStatus() {
    this.importService.checkTaskStatus(this.statusTaskId);
  }

  reset() {
    this.importService.reset();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files.length) {
      this.importService.selectFile(event.dataTransfer.files[0]);
    }
  }

  cancelImport() {
    this.importService.cancelImport();
  }
}
