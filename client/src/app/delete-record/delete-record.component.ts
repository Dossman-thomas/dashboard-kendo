import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { ColDef } from 'ag-grid-community';
import { DeleteButtonRendererComponent } from '../delete-button-renderer/delete-button-renderer.component';

@Component({
  selector: 'app-delete-record',
  templateUrl: './delete-record.component.html',
  styleUrls: ['../../styles.css','./delete-record.component.css']
})
export class DeleteRecordComponent implements OnInit {
  users: User[] = [];
  rowData: User[] = [];

  constructor(private userService: UserService) { }

  paginationPageSizeSelector = [10, 25, 50, 100];
  paginationPageSize = 25;
  pagination = true;

  defaultColDef: ColDef = {
    flex: 1,
    filter: true,
    sortable: true,
  };

  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'name', headerName: 'Name', flex: 3 },
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'role', headerName: 'Role', flex: 2 },
    {
      headerName: 'Delete Record',
      cellRenderer: DeleteButtonRendererComponent, // Custom cell renderer for delete button
      cellRendererParams: {
        onClick: this.onDelete.bind(this),
      },
      filter: false,
      sortable: false,
      resizable: false,
    },
  ];

  ngOnInit() {
    // Fetch all users and set the rowData for the AG Grid
    this.userService.getAllUsers().subscribe({
      next: (response: any) => {
        // Access `rows` within the response if it exists and is an array
        if (Array.isArray(response.rows)) {
          this.users = response.rows as User[];  // Store the fetched users
          this.rowData = [...this.users];  // Set the rowData for the grid
        } else {
          console.error('Expected rows array but got:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }
  

  // Method to handle deletion of a user
  onDelete(userId: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.userService.deleteUser(userId).subscribe(() => {
        // Remove the user from the array after successful deletion
        this.users = this.users.filter(user => user.id !== userId);
        this.rowData = [...this.users];  // Update the rowData for the AG Grid
      }, error => {
        console.error('Error deleting user:', error);  // Handle errors
      });
    }
  }
}
