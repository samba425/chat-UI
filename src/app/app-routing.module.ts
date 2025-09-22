import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { incidentQueryComponent } from './components/incidentQuery/incident-query.component'
import { LoginComponent } from './components/Login/login.component';
import { AuthGuard } from './services/auth.guard';

import { DocumentListComponent } from './components/document-list/document-list.component';
import { DataDashboardComponent } from './components/data-dashboard/data-dashboard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: incidentQueryComponent, canActivate: [AuthGuard], pathMatch: 'full' },
  { path: 'incident', component: incidentQueryComponent, canActivate: [AuthGuard] },
  { path: 'data', component: DataDashboardComponent, canActivate: [AuthGuard] },
  { path: 'documents', component: DocumentListComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
