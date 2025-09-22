import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component'; 
import { incidentQueryComponent } from './components/incidentQuery/incident-query.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalTemplateComponent } from './components/modal/modal.component';
import { ChatService } from './services/chat.service';
import { AppRoutingModule } from './app-routing.module';
import { ThemeService } from './services/theme.service';
import { LoginComponent } from './components/Login/login.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { DataDashboardComponent } from './components/data-dashboard/data-dashboard.component';
import { SettingsDashboardComponent } from './components/settings-dashboard/settings-dashboard.component';
import { CustomDateTimePipe } from './pipes/custom-date-time.pipe';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { ImportDataComponent } from './components/import-data/import-data.component';
import { StatusDashboardComponent } from './components/status-dashboard/status-dashboard.component';
import { StatusService } from './services/status.service';

@NgModule({
  declarations: [
    AppComponent,
    incidentQueryComponent,
    ModalTemplateComponent,
    LoginComponent,
    DataDashboardComponent,
    DocumentListComponent,
    ImportDataComponent,
    SettingsDashboardComponent,
    StatusDashboardComponent
  ],
  imports: [
    AppRoutingModule,
    RouterOutlet,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CustomDateTimePipe
    ],
  providers: [ChatService, ThemeService, StatusService, { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
