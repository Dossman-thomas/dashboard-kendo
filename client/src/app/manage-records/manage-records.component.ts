import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { PermissionsService } from '../services/permissions.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

@Component({
  selector: 'app-manage-records',
  templateUrl: './manage-records.component.html',
  styleUrls: ['./manage-records.component.css'],
})
export class ManageRecordsComponent implements OnInit {
  users: User[] = [];
  showModal: boolean = false; // show/hide create modal
  showEditModal: boolean = false; // show/hide edit modal
  showDeleteModal: boolean = false; // show/hide delete modal
  deleteUserId: number | null = null; // ID of user to be deleted
  createUserForm!: FormGroup; // Form group for creating a new user
  editUserForm!: FormGroup; // Form group for editing a user
  selectedUser!: User | null; // User currently being edited
  roles: string[] = ['admin', 'data manager', 'employee'];
  showPassword: boolean = false;
  emailAvailable: boolean = false;
  emailErrorMessage: string = '';

  // Permissions flags
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;

  // Kendo Grid settings
  gridData: any = { data: [], total: 0 };
  body: any = {
    page: 1,
    limit: 10,
    sorts: null,
    filters: null,
  };

  // Kendo Grid state
  public state: State = {
    skip: 0,
    take: 10,
    sort: [],
    filter: {
      logic: 'and',
      filters: [],
    },
  };

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private permissionsService: PermissionsService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.setPermissions();
    this.loadUsers();
  }

  // Fetch current user's permissions
  setPermissions(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.permissionsService
        .getPermissionsForRole(currentUser.role)
        .subscribe({
          next: (permissions) => {
            if (permissions) {
              this.canCreate = permissions.canCreate;
              this.canUpdate = permissions.canUpdate;
              this.canDelete = permissions.canDelete;
            } else {
              console.warn('Permissions are undefined.');
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

  // Initialize the forms
  initializeForms() {
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

    this.editUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });
  }

  // Handle state changes for Kendo Grid (pagination, sorting, filtering)
  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.body.page = Math.floor(state.skip / state.take) + 1; // Calculate current page
    this.body.limit = state.take;

    // Apply sorting
    this.body.sorts =
      state.sort?.map((sortElement) => ({
        field: sortElement.field,
        dir: sortElement.dir,
      })) || null;

    // Apply filtering
    this.body.filters =
      state.filter?.filters
        ?.flatMap((item: any) => item.filters || [])
        .map((filter: any) => ({
          field: filter.field,
          operator: filter.operator || 'contains', // Default operator
          value: filter.value,
        })) || null;

    console.log('Updated request payload:', this.body);

    // Reload users with updated state
    this.loadUsers();
  }

  // Load users with pagination and filters
  private loadUsers(): void {
    console.log('Request payload for users:', this.body);

    this.userService.getAllUsers(this.body).subscribe({
      next: (response: any) => {
        if (Array.isArray(response.rows)) {
          this.users = response.rows;
          this.gridData = {
            data: this.users,
            total: response.count || response.rows.length,
          };
          console.log('Loaded users:', this.gridData);
        } else {
          console.error('Unexpected response format:', response);
        }
      },
    });
  }

  // Show the delete confirmation modal
  confirmDelete(userId: number): void {
    this.deleteUserId = userId;
    this.showDeleteModal = true;
  }
  
  // Delete user after confirmation
  onConfirmDelete(): void {
    if (this.deleteUserId !== null) {
      this.userService.deleteUser(this.deleteUserId).subscribe(
        () => {
          this.users = this.users.filter((user) => user.id !== this.deleteUserId);
          this.gridData = {
            data: this.users,
            total: this.gridData.total,
          };
          this.toastr.success('User deleted successfully.');
          this.loadUsers();
        },
        (error) => {
          this.toastr.error('Failed to delete user. Please try again.');
          console.error('Error deleting user:', error);
        }
      );
    }
    this.resetDeleteModal();
  }
  
  // Cancel the delete operation
  onCancelDelete(): void {
    this.resetDeleteModal();
  }
  
  // Reset the delete modal state
  private resetDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteUserId = null;
  }

  // Create new user with email check
  onCreateUser(): void {
    if (this.createUserForm.invalid) return;

    const newUser: User = this.createUserForm.value;
    this.checkEmailAvailability(newUser.email).subscribe(
      (isAvailable: boolean) => {
        if (isAvailable) {
          this.userService.createUser(newUser).subscribe({
            next: (createdUser) => {
              this.users.push(createdUser);
              this.gridData = {
                data: this.users,
                total: this.gridData.total,
              };
              this.toggleModal();
              this.toastr.success('User created successfully!');
              this.loadUsers();
            },
            error: (error) => {
              this.toastr.error('Failed to create user. Please try again.');
              this.emailErrorMessage =
                'This email is already in use. Please choose a different one.';
              console.error('Error creating user:', error);
            },
          });
        } else {
          this.emailErrorMessage =
            'This email is already in use. Please choose a different one.';
        }
      }
    );
  }

  // Update existing user with email check
  onUpdateUser(): void {
    if (this.editUserForm.invalid || !this.selectedUser) return;

    const updatedUser: User = {
      ...this.selectedUser,
      ...this.editUserForm.value,
    };

    // Skip email check if it's the same as the user's current email
    if (updatedUser.email === this.selectedUser.email) {
      this.updateUser(updatedUser);
      return;
    }

    this.checkEmailAvailability(updatedUser.email).subscribe(
      (isAvailable: boolean) => {
        if (isAvailable) {
          this.updateUser(updatedUser);
        } else {
          this.emailErrorMessage =
            'This email is already in use. Please choose a different one.';
        }
      }
    );
  }

  private updateUser(user: User): void {
    if (user.id !== undefined) {
      this.userService.updateUser(user.id, user).subscribe({
        next: () => {
          this.toastr.success('User updated successfully!');
          this.showEditModal = false;
          this.loadUsers();
        },
        error: (error) => {
          this.toastr.error('Failed to update user. Please try again.');
          console.error('Error updating user:', error);
        },
      });
    } else {
      console.error('User ID is undefined');
    }
  }

  // Helper method for checking email availability with current user ID
  private checkEmailAvailability(email: string): any {
    const userId =
      this.selectedUser?.id ?? this.userService.getCurrentUser()?.id;
    if (userId !== undefined) {
      return this.userService.checkEmailAvailability(email, userId);
    } else {
      console.error('User ID is undefined for email check');
      return of(false); // Return an observable with a false value if no ID is found
    }
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.resetCreateForm();
      this.emailErrorMessage = ''; // Clear email error message
    }
  }

  toggleEditModal(user?: User) {
    this.showEditModal = !this.showEditModal;
    if (user) {
      this.selectedUser = user;
      this.editUserForm.patchValue(user);
    } else {
      this.selectedUser = null;
      this.editUserForm.reset();
    }
    this.emailErrorMessage = ''; // Clear email error message
  }

  resetCreateForm() {
    this.createUserForm.reset();
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
