import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  of,
  map,
  catchError,
  throwError,
} from 'rxjs';

export interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
  password: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:5000/api/users';

  // Helper method to get the Authorization header
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Use JWT token
    });
  }

  // Define the currentUserSubject as a BehaviorSubject
  private currentUserSubject: BehaviorSubject<User | null>;

  // Define currentUser$ as an Observable for the current user
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    // Initialize the current user from localStorage, if available
    const storedUser = localStorage.getItem('currentUser');
    const initialUser = storedUser ? JSON.parse(storedUser) : null;

    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Method to get the current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  clearCurrentUser(): void {
    return this.currentUserSubject.next(null);
  }

  // Set the current user and save it to localStorage
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  // Get the current user value
  getCurrentUsers(): Observable<User[]> {
    return this.getAllUsers(); // Call the existing method to fetch users
  }

  // Create a new user
  createUser(userData: User): Observable<User> {
    return this.http
      .post<{ status: number; message: string; data: User }>(
        `${this.baseUrl}/create-new`,
        userData,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        map((response) => {
          const createdUser = response.data;
          return createdUser;
        }),
        catchError((error) => {
          console.error('Error creating user:', error);
          return throwError(
            () => new Error('Failed to create user. Please try again later.')
          );
        })
      );
  }

  // Get a user by ID
  getUserById(id: number): Observable<User> {
    return this.http
      .get<User>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map((res) => res), // Extract the response
        catchError((error) => {
          console.error('Error fetching user:', error); // Log the error
          return throwError(
            () => new Error('Failed to fetch user. Please try again later.')
          ); // Return an observable error
        })
      );
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http
      .get<any>(`${this.baseUrl}`, { headers: this.getHeaders() })
      .pipe(
        map((res) => res.data), // Extract the 'data' property
        catchError((error) => {
          console.log('Error fetching users:', error); // Log the error
          return throwError(
            () => new Error('Failed to fetch users. Please try again later.')
          ); // Return an observable error
        })
      );
  }
  

  // Update user information and reset the current user in localStorage
  updateUser(id: number, userData: User): Observable<User> {
    return this.http
      .put<{ status: number; message: string; data: User }>(
        `${this.baseUrl}/update/${id}`,
        userData,
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => {
          const updatedUser = response.data;

          // If the updated user is the current user, update the stored current user
          const currentUser = this.getCurrentUser();
          if (currentUser && currentUser.id === updatedUser.id) {
            this.setCurrentUser(updatedUser);
            console.log('Current user updated:', updatedUser);
          }

          return updatedUser; // Return only the updated user object
        }),
        catchError((error) => {
          console.error('Error updating user:', error);
          return throwError(
            () => new Error('Failed to update user. Please try again later.')
          );
        })
      );
  }

  // Delete a user by ID
  deleteUser(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/delete/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((res) => {
          console.log('User deleted successfully', res);
          return res;
        }),
        catchError((error) => {
          console.error('Error deleting user:', error);
          return throwError(
            () => new Error('Failed to delete user. Please try again later.')
          );
        })
      );
  }

  checkEmailAvailability(email: string, currentUserId: number): Observable<boolean> {
    return this.http
      .post<{ data: { isAvailable: boolean } }>(`${this.baseUrl}/check-email/${currentUserId}`, { email }, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.data.isAvailable),
        catchError(this.handleError<boolean>('checkEmailAvailability'))
      );
  }


  // Verify user password (if you choose to implement it)
  // verifyPassword(
  //   id: number,
  //   passwordData: { password: string }
  // ): Observable<boolean> {
  //   return this.http.post<boolean>(
  //     `${this.baseUrl}/${id}/verify-password`,
  //     passwordData
  //   );
  // }

  // Error handling method
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
