import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { ColDef, GridApi } from 'ag-grid-community';
// import { UpdateButtonRendererComponent } from '../update-button-renderer/update-button-renderer.component';
import { AgGridAngular } from 'ag-grid-angular';
// import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-update-record',
  templateUrl: './update-record.component.html',
  styleUrls: ['./update-record.component.css'],
})
export class UpdateRecordComponent implements OnInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  users: User[] = [];
  selectedUser: User = { id: 0, name: '', email: '', password: '', role: '' };
  gridApi!: GridApi<User>;

  constructor(private userService: UserService) {}

  paginationPageSizeSelector = [10, 25, 50, 100];
  paginationPageSize = 25;
  pagination = true;

  defaultColDef: ColDef = {
    flex: 1,
    filter: true,
    sortable: true,
    editable: true, // Make all columns editable
  };

  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', editable: false },
    { field: 'name', headerName: 'Name', flex: 3 },
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'role', headerName: 'Role', flex: 2 },
  ];

  ngOnInit() {
    this.fetchUsers();
  }


  fetchUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response: any) => {
        // Check if response.rows exists and is an array
        if (Array.isArray(response.rows)) {
          this.users = response.rows as User[];
          if (this.gridApi) {
            this.gridApi.applyTransaction({ add: this.users }); // Apply the data transaction
          }
          console.log('Users:', this.users);
        } else {
          console.error('Expected rows array but got:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }
  
  

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.fetchUsers(); // Fetch users when the grid is ready
  }

  onCellValueChanged(event: any): void {
    const updatedUser: User = event.data as User;

    // Check if id is defined
    if (updatedUser.id) {
      this.userService.updateUser(updatedUser.id, updatedUser).subscribe({
        next: () => {
          console.log('User updated:', updatedUser);
          alert('User updated successfully!');
        },
        error: (error) => {
          console.error('Error updating user:', error);
        },
      });
    } else {
      console.error('User ID is undefined');
    }
  }
}
