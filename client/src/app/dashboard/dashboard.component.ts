import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { CompositeFilterDescriptor, FilterDescriptor, State } from '@progress/kendo-data-query';
import {
  DataStateChangeEvent,
  FilterableSettings,
} from '@progress/kendo-angular-grid';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  totalUsers: number = 0;
  dataManagerCount: number = 0;
  employeeCount: number = 0;
  firstName: string = '';

  // Kendo Grid settings
  gridData: any = { data: [], total: 0 };
  skip: number = 0;
  take: number = 10;
  sort: any[] = [];
  filter: any = {
    filterField: '',
    filterValue: '',
  };
  // public filterMode: FilterableSettings = 'menu';

  // Kendo Grid state
  public state: State = {
    skip: this.skip,
    take: this.take,
    sort: this.sort,
    filter: this.filter,
  };

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

    // Fetch users and role statistics
    this.loadUsers();
    this.loadRoleStatistics();
  }

  // Load users with pagination, filtering, and sorting
  loadUsers(): void {
    const page = (this.skip + this.take) / this.take; // Calculate page number
    const params = {
      page,
      limit: this.take,
      searchQuery: this.filter.filterValue, // Use the filter value
      sortBy: this.state.sort?.[0]?.field || 'createdAt', // Default to 'createdAt'
      order:
        (this.state.sort?.[0]?.dir?.toUpperCase() as 'DESC' | 'ASC') || 'ASC', // Default to 'DESC'
    };

    this.userService.getAllUsers(params).subscribe({
      next: (response: any) => {
        if (Array.isArray(response.rows)) {
          const users = response.rows as User[];
          console.log('Users:', users);
          this.users = users;
          this.totalUsers = response.count || users.length;
          this.gridData = {
            data: users,
            total: response.count,
          };
          console.log('Grid data:', this.gridData);
        } else {
          console.error('Expected rows array but got:', response);
        }
      },
      error: (error) => {
        console.error('Failed to fetch users:', error);
      },
    });
  }

  // Load role statistics
  loadRoleStatistics(): void {
    this.userService.getRoleStatistics().subscribe({
      next: (stats) => {
        this.dataManagerCount = stats.datamanagerCount;
        this.employeeCount = stats.employeeCount;
        console.log('Role statistics:', stats);
      },
      error: (error) => {
        console.error('Failed to fetch role statistics:', error);
      },
    });
  }

  // Handle state changes for pagination, filtering, and sorting
  public dataStateChange(state: DataStateChangeEvent): void {
    // Check if sorting has changed
    if (state.sort && state.sort.length) {
      const currentSortField = state.sort[0].field;
      const currentGridSort = this.state.sort?.[0];
    
      // If sorting on the same column, toggle the direction
      if (currentGridSort && currentSortField === currentGridSort.field) {
        // Toggle between 'asc' and 'desc', or reset to unsorted if already desc
        if (currentGridSort.dir === 'asc') {
          state.sort[0].dir = 'desc';
        } else if (currentGridSort.dir === 'desc') {
          state.sort = []; // Reset to unsorted
        } else {
          state.sort[0].dir = 'asc';
        }
      }
    }
  
    // Update the component's state
    this.state = state;
  
    // Update skip and take for pagination
    this.skip = state.skip!;
    this.take = state.take!;
  
    // Update sort state
    this.sort = state.sort || [];
  
    // Handle filtering with type-safe approach
    if (state.filter) {
      // Type guard to check if it's a CompositeFilterDescriptor
      const isCompositeFilter = (filter: any): filter is CompositeFilterDescriptor => 
        filter && Array.isArray(filter.filters);
  
      if (isCompositeFilter(state.filter)) {
        // If it's a composite filter, drill down to the actual filter
        const topLevelFilter = state.filter.filters[0];
        
        // Another type guard
        if (isCompositeFilter(topLevelFilter)) {
          const actualFilter = topLevelFilter.filters[0] as FilterDescriptor;
          
          this.filter = {
            filterField: actualFilter.field || 'name',
            filterValue: actualFilter.value || ''
          };
        } else {
          // Fallback if unexpected filter structure
          this.filter = {
            filterField: 'name',
            filterValue: ''
          };
        }
      } else {
        // Fallback if not a composite filter
        this.filter = {
          filterField: 'name',
          filterValue: ''
        };
      }
    } else {
      // Reset filter when no filter is applied
      this.filter = {
        filterField: 'name',
        filterValue: ''
      };
    }
  
    console.log('State filter:', state.filter);
    console.log('Processed filter:', this.filter);
    
    // Reload users with new state
    this.loadUsers();
  }

}  
