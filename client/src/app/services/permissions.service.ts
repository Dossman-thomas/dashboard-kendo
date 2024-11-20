import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

// Interface to define role permissions
export interface RolePermissions {
  role: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

// Interface for the API response
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private rolesPermissionsSubject = new BehaviorSubject<RolePermissions[]>([]);
  rolePermissions$ = this.rolesPermissionsSubject.asObservable();
  private apiUrl = 'http://localhost:5000/api/permissions'; // Base URL for permissions API

  constructor(private http: HttpClient) {
    // Load initial permissions data from the backend
    this.loadPermissions();
  }

  // getPermissions$ method to return the observable
  getPermissions$(): Observable<RolePermissions[]> {
    return this.rolePermissions$;
  }

  // Fetch all role permissions from the backend and emit them
  private loadPermissions(): void {
    this.http.get<ApiResponse<RolePermissions[]>>(this.apiUrl)
      .pipe(
        catchError(this.handleError),
        tap(response => {
          // console.log('Loaded permissions:', response); // Log the full response for debugging
          this.rolesPermissionsSubject.next(response.data); // Emit the data array
        })
      )
      .subscribe();
  }

  // Get permissions for a specific role from the backend
  getPermissionsForRole(role: string): Observable<RolePermissions | undefined> {
    // console.log(`Fetching permissions for role: ${role}`);
  
    return this.http.get<ApiResponse<RolePermissions>>(`${this.apiUrl}/role/${role}`).pipe(
      map(response => {
        // console.log(`Received response for role '${role}':`, response);
        return response.data; // Extract the data property
      }),
      catchError(error => {
        console.error(`Error fetching permissions for role '${role}':`, error);
        return this.handleError(error);
      })
    );
  }
  

  // Update permissions for a specific role on the backend
  updatePermissions(role: string, updatedPermissions: Partial<RolePermissions>): Observable<RolePermissions> {
    return this.http.put<ApiResponse<RolePermissions>>(`${this.apiUrl}/role/${role}`, updatedPermissions).pipe(
      map(response => response.data), // Extract data property
      tap((permissions) => {
        console.log('Updated permissions:', permissions); // Log updated permissions
        // Update local cache after successful update
        const currentPermissions = this.rolesPermissionsSubject.getValue();
        const updatedList = currentPermissions.map(rp => rp.role === role ? permissions : rp);
        this.rolesPermissionsSubject.next(updatedList); // Emit the updated list
      }),
      catchError(this.handleError)
    );
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error: ${error.status}, message: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
