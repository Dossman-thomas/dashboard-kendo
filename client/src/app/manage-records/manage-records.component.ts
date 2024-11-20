import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { PermissionsService } from '../services/permissions.service';
import { ColDef, GridApi } from 'ag-grid-community';
import { DeleteButtonRendererComponent } from '../delete-button-renderer/delete-button-renderer.component';
import { AgGridAngular } from 'ag-grid-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-records',
  templateUrl: './manage-records.component.html',
  styleUrls: ['./manage-records.component.css'],
})
export class ManageRecordsComponent implements OnInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  users: User[] = [];
  rowData: User[] = [];
  gridApi!: GridApi<User>;
  showModal: boolean = false; // show/hide modal
  createUserForm!: FormGroup; // Form group for creating a new user
  roles: string[] = ['admin', 'data manager', 'employee'];
  showPassword: boolean = false;

  // Permissions flags
  canCreate: boolean = false;
  canUpdate: boolean = false;
  // canDelete: boolean = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private permissionsService: PermissionsService
  ) {}

  paginationPageSizeSelector = [10, 25, 50, 100];
  paginationPageSize = 25;
  pagination = true;

  defaultColDef: ColDef = {
    flex: 1,
    filter: true,
    sortable: true,
    editable: (params) => this.canUpdate, // Enable editing based on permissions
  };

  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', editable: false },
    { field: 'name', headerName: 'Name', flex: 3 },
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'role', headerName: 'Role', flex: 2 },
    {
      headerName: 'Action',
      cellRenderer: DeleteButtonRendererComponent, // Custom cell renderer for delete button
      cellRendererParams: {
        onClick: this.onDelete.bind(this),
        // canDelete: this.canDelete // Pass the permission flag to the renderer
      },
      editable: false,
      filter: false,
      sortable: false,
      resizable: false,
    },
  ];

  ngOnInit() {
    this.initializeForm();
    this.setPermissions();
  }

  // Fetch current user's permissions
  setPermissions(): void {
    // console.log('Fetching current user for permissions...');
    
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      console.log(`Current user role: ${currentUser.role}`);
      
      this.permissionsService.getPermissionsForRole(currentUser.role).subscribe({
        next: (permissions) => {
          if (permissions) {
            this.canCreate = permissions.canCreate;
            this.canUpdate = permissions.canUpdate;
            // this.canDelete = permissions.canDelete;
            
            // console.log(`Permissions for role '${currentUser.role}':`);
            console.log(`- Can create: ${this.canCreate}`);
            console.log(`- Can update: ${this.canUpdate}`);
            // console.log(`- Can delete: ${this.canDelete}`);
          } else {
            console.warn(`No permissions found for role: ${currentUser.role}`);
          }
        },
        error: (error) => {
          console.error('Error fetching permissions:', error);
        },
      });
    } else {
      console.warn('No current user found. Unable to set permissions.');
    }
  }
  

  // Initialize the create user form
  initializeForm() {
    this.createUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]+$'
          ),
        ],
      ],
    });
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
          // console.log('Users:', this.users);
        } else {
          console.error('Expected rows array but got:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    // console.log('Grid API initialized:', this.gridApi);
    this.fetchUsers();
  }

  onCellValueChanged(event: any): void {
    if (!this.canUpdate) {
      console.error('You do not have permission to update this record.');
      return;
    }

    const updatedUser: User = event.data;
    if (updatedUser.id) {
      this.userService.updateUser(updatedUser.id, updatedUser).subscribe({
        next: () => alert('User updated successfully!'),
        error: (error) => console.error('Error updating user:', error),
      });
    } else {
      console.error('User ID is undefined');
    }
  }

  onDelete(userId: number): void {
    // if (!this.canDelete) {
    //   alert("You don't have permission to delete this record.");
    //   return;
    // }

    if (confirm('Are you sure you want to delete this record?')) {
      this.userService.deleteUser(userId).subscribe(
        () => {
          // Remove the user from the array after successful deletion
          this.users = this.users.filter((user) => user.id !== userId);
          this.rowData = [...this.users]; // Update the rowData for the AG Grid
        },
        (error) => {
          console.error('Error deleting user:', error); // Handle errors
        }
      );
    }
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) this.resetForm(); // Reset form when closing the modal
  }

  onCreateUser(): void {
    if (this.createUserForm.invalid) return; // Check form validity

    const newUser: User = this.createUserForm.value;
    this.userService.createUser(newUser).subscribe({
      next: (response) => {
        // Use `response` here, without specific type
        const createdUser = response; // Access the nested 'data' key

        this.users.push(createdUser); // Add the new user to the local array
        console.log('User created successfully:', createdUser);

        // Update the grid
        if (this.gridApi) {
          // this.gridApi.applyTransaction({ add: [createdUser] }); // Apply the transaction
          this.fetchUsers(); 
        } else {
          console.error('Grid API is not initialized.');
        }

        // Close the modal
        this.toggleModal();
        console.log('Modal successfully closed.');
      },
      error: (error) => console.error('Error creating user:', error),
    });
  }

  resetForm() {
    this.createUserForm.reset(); // Reset form fields
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  passwordValidator(control: { value: string }) {
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
    if (!valid) {
      return { passwordInvalid: true };
    }
    return null;
  }
}
