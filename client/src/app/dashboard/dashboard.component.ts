import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { State } from '@progress/kendo-data-query';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  totalUsers: number = 0;
  adminCount: number = 0;
  dataManagerCount: number = 0;
  employeeCount: number = 0;
  firstName: string = '';

  // Kendo Grid settings
  gridData: any = { data: [], total: 0 };
  skip: number = 0;
  take: number = 10;

  // Kendo Grid state
  public state: State = {
    skip: this.skip,
    take: this.take,
    // filter: undefined,
    // sort: undefined, 
  };

  // rowData: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Retrieve current user from localStorage
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const currentUser: User = JSON.parse(currentUserData);
      this.firstName = currentUser.name.split(' ')[0]; // Extract first name
    } else {
      // Handle case where there is no logged-in user
      this.firstName = 'User';
    }

    // Fetch users from the API
    this.loadUsers();
  }

  // Load users with pagination and filters
  loadUsers(): void {
    const page = this.skip / this.take + 1;
    this.userService.getAllUsers({ page, limit: this.take }).subscribe({
      next: (response: any) => {
        if (Array.isArray(response.rows)) {
          const users = response.rows as User[];
          this.users = users;
          this.totalUsers = response.count || users.length;
          this.gridData = {
            data: users,
            total: response.count,
          };
          // Calculate role counts directly
          this.adminCount = users.filter(user => user.role === 'admin').length;
          this.dataManagerCount = users.filter(user => user.role === 'data manager').length;
          this.employeeCount = users.filter(user => user.role === 'employee').length;
        } else {
          console.error('Expected rows array but got:', response);
        }
      },
      error: (error) => {
        console.error('Failed to fetch users:', error);
      },
    });
  }
  

  // Handle state changes for pagination, filtering, and sorting
  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.skip = state.skip!;
    this.take = state.take!;
    this.loadUsers();
  }
}