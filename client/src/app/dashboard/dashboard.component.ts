import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { ColDef } from 'ag-grid-community';

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

  paginationPageSizeSelector = [10, 25, 50, 100];
  paginationPageSize = 10;
  pagination = true;

  defaultColDef: ColDef = {
    flex: 1,
    filter: true,
    sortable: true,
  };

  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'name', headerName: 'Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'role', headerName: 'Role' }
  ];

  rowData: User[] = [];

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
    this.fetchUsers();
  }

  // Method to fetch users via UserService
  fetchUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response: any) => {
        // Check if response has rows and rows is an array
        if (Array.isArray(response.rows)) {
          const users = response.rows as User[];
          this.users = users;
          this.totalUsers = response.count || users.length; // Use count from response if available
          this.rowData = users;
          this.adminCount = users.filter(user => user.role === 'admin').length;
          this.dataManagerCount = users.filter(user => user.role === 'data manager').length;
          this.employeeCount = users.filter(user => user.role === 'employee').length;
        } else {
          console.error('Expected an array but got:', response);
        }
      },
      error: (error) => {
        console.error('Failed to fetch users:', error);
      }
    });
  }
  
  
  
  
  
}