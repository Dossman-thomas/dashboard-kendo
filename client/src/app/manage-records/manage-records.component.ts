import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { PermissionsService } from '../services/permissions.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataStateChangeEvent, FilterableSettings } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';

@Component({
  selector: 'app-manage-records',
  templateUrl: './manage-records.component.html',
  styleUrls: ['./manage-records.component.css'],
})
export class ManageRecordsComponent implements OnInit {

  users: User[] = [];
  gridData: any = { data: [], total: 0 };
  showModal: boolean = false; // show/hide modal
  createUserForm!: FormGroup; // Form group for creating a new user
  roles: string[] = ['admin', 'data manager', 'employee'];
  showPassword: boolean = false;

  // pagesize:any=[5,10,25,50,100];
  skip: number = 0;
  take: number = 10;

  // filter settings
  public filterMode: FilterableSettings = 'menu'; 

  // Permissions flags
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private permissionsService: PermissionsService
  ) {}

  // Pagination settings
  public state: State = {
    skip: this.skip,
    take: this.take,
    sort: [],
  };


  ngOnInit() {
    this.initializeForm();
    this.setPermissions();
    this.loadUsers();
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
            this.canDelete = permissions.canDelete;
            
            // console.log(`Permissions for role '${currentUser.role}':`);
            console.log(`- Can create: ${this.canCreate}`);
            console.log(`- Can update: ${this.canUpdate}`);
            console.log(`- Can delete: ${this.canDelete}`);
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

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.skip = state.skip!;
    this.take = state.take!;
    this.loadUsers();
}

  // Load users with pagination and filters
  loadUsers() {
    const page = this.skip / this.take + 1;
    this.userService.getAllUsers({ page, limit: this.take }).subscribe({
      next: (response: any) => {
        if (Array.isArray(response.rows)) {
          this.users = response.rows;
          this.gridData = {
            data: response.rows,
            total: response.count,
          };
        } else {
          console.error('Expected rows array but got:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }

  // onGridReady(params: any) {
  //   this.gridApi = params.api;
  //   // console.log('Grid API initialized:', this.gridApi);
  //   this.fetchUsers();
  // }

  onUpdate(event: any): void {
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

  // Handle row deletion
  onDelete(userId: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.userService.deleteUser(userId).subscribe(
        () => {
          this.users = this.users.filter((user) => user.id !== userId);
          this.gridData = {
            data: this.users,
            total: this.gridData.total,
          };
          alert('User deleted successfully');
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) this.resetForm(); // Reset form when closing the modal
  }

  // Create new user
  onCreateUser(): void {
    if (this.createUserForm.invalid) return;

    const newUser: User = this.createUserForm.value;
    this.userService.createUser(newUser).subscribe({
      next: (createdUser) => {
        this.users.push(createdUser);
        this.gridData = {
          data: this.users,
          total: this.gridData.total,
        };
        this.toggleModal();
        alert('User created successfully');
        this.loadUsers();

      },
      error: (error) => {
        console.error('Error creating user:', error);
      },
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
