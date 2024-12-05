import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AgGridAngular } from 'ag-grid-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
import { GridModule } from '@progress/kendo-angular-grid';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ManagePermissionsComponent } from './manage-permissions/manage-permissions.component';
import { CreateRecordComponent } from './create-record/create-record.component';
import { UpdateRecordComponent } from './update-record/update-record.component';
import { DeleteRecordComponent } from './delete-record/delete-record.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { DeleteButtonRendererComponent } from './delete-button-renderer/delete-button-renderer.component';
import { UpdateButtonRendererComponent } from './update-button-renderer/update-button-renderer.component';
import { LayoutComponent } from './layout/layout.component';
import { ManageRecordsComponent } from './manage-records/manage-records.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    HeaderComponent,
    SidebarComponent,
    ManagePermissionsComponent,
    CreateRecordComponent,
    UpdateRecordComponent,
    DeleteRecordComponent,
    MyAccountComponent,
    DeleteButtonRendererComponent,
    UpdateButtonRendererComponent,
    LayoutComponent,
    ManageRecordsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AgGridAngular,
    ReactiveFormsModule,
    HttpClientModule,
    GridModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 1500, // 1.5 second duration for toasts
      positionClass: 'toast-top-right', 
      preventDuplicates: true,
    }),
  ],
  providers: [ 
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, // Add the AuthInterceptor to the providers array
  ],
  bootstrap: [AppComponent], // Start with the AppComponent
})
export class AppModule {}
