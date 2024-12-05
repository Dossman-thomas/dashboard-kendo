import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { PermissionsService } from '../services/permissions.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  DataStateChangeEvent,
  FilterableSettings,
} from '@progress/kendo-angular-grid';
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
  gridData: any = { data: [], total: 0 };
  showModal: boolean = false; // show/hide create modal
  showEditModal: boolean = false; // show/hide edit modal
  createUserForm!: FormGroup; // Form group for creating a new user
  editUserForm!: FormGroup; // Form group for editing a user
  selectedUser!: User | null; // User currently being edited
  roles: string[] = ['admin', 'data manager', 'employee'];
  showPassword: boolean = false;
  emailAvailable: boolean = false;
  emailErrorMessage: string = '';

  // Pagination settings
  skip: number = 0;
  take: number = 10;

  // Filter settings
  public filterMode: FilterableSettings = 'menu';

  // Permissions flags
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private permissionsService: PermissionsService,
    private toastr: ToastrService
  ) {}

  public state: State = {
    skip: this.skip,
    take: this.take,
  };

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

  // onUpdate(event: any): void {
  //   if (!this.canUpdate) {
  //     console.error('You do not have permission to update this record.');
  //     return;
  //   }

  //   const updatedUser: User = event.data;
  //   if (updatedUser.id) {
  //     this.userService.updateUser(updatedUser.id, updatedUser).subscribe({
  //       next: () => alert('User updated successfully!'),
  //       error: (error) => console.error('Error updating user:', error),
  //     });
  //   } else {
  //     console.error('User ID is undefined');
  //   }
  // }

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
          this.toastr.success('User deleted successfully.');
        },
        (error) => {
          this.toastr.error('Failed to delete user. Please try again.');
          console.error('Error deleting user:', error);
        }
      );
    }
  }

  // Create new user with email check
  onCreateUser(): void {
    if (this.createUserForm.invalid) return;

    const newUser: User = this.createUserForm.value;
    this.checkEmailAvailability(newUser.email).subscribe((isAvailable: boolean) => {
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
            console.error('Error creating user:', error);
          },
        });
      } else {
        this.emailErrorMessage =
          'This email is already in use. Please choose a different one.';
      }
    });
  }

  // Update existing user with email check
  onUpdateUser(): void {
    if (this.editUserForm.invalid || !this.selectedUser) return;

    const updatedUser: User = {
      ...this.selectedUser,
      ...this.editUserForm.value,
    };

    this.checkEmailAvailability(updatedUser.email).subscribe(
      (isAvailable: boolean) => {
        if (isAvailable) {
          if (updatedUser.id !== undefined) {
            this.userService.updateUser(updatedUser.id, updatedUser).subscribe({
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
        } else {
          this.emailErrorMessage =
            'This email is already in use. Please choose a different one.';
        }
      }
    );
  }

// Helper method for checking email availability with current user ID
private checkEmailAvailability(email: string): any {
  const currentUser = this.userService.getCurrentUser();
  if (currentUser && currentUser.id !== undefined) {
    return this.userService.checkEmailAvailability(email, currentUser.id);
  } else {
    console.error('Current user ID is undefined');
    return of(false); // Return an observable with a false value if currentUser is not defined
  }
}

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) this.resetCreateForm();
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
