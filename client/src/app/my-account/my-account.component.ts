import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../services/user.service';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'],
})
export class MyAccountComponent implements OnInit {
  currentUser: User | null = null;
  isEditing = false;
  isChangingPassword = false;
  userForm: FormGroup;
  passwordForm: FormGroup;
  passwordError = '';
  emailAvailable: boolean = false;
  emailErrorMessage = '';
  showPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(15),
          this.passwordValidator,
        ],
      ],
      confirmNewPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
        });
      }
    });
  }

  loadCurrentUser(): void {
    const user = this.userService.getCurrentUser();
    this.currentUser = user;
    if (user) {
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
      });
    }
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onCancelEdit(): void {
    this.isEditing = false;
    this.loadCurrentUser(); // Reset changes
  }

  onSubmit(): void {
    if (this.userForm.valid && this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        name: this.userForm.value.name,
        email: this.userForm.value.email,
      };

      this.checkEmailAvailability(updatedUser.email).subscribe(
        (isAvailable: boolean) => {
          if (isAvailable) {
            if (this.currentUser?.id !== undefined) {
              this.userService
                .updateUser(this.currentUser.id, updatedUser)
                .subscribe({
                  next: (user) => {
                    console.log('User updated:', user);
                    this.userService.setCurrentUser(user); // Update the current user in UserService
                    this.toastr.success('Account updated successfully!');
                    this.isEditing = false;
                  },
                  error: (error) => {
                    console.error('Error updating user:', error);
                    this.toastr.error(
                      'Failed to update account. Please try again.'
                    );
                  },
                });
            } else {
              console.error('User ID is undefined');
            }
          } else {
            this.emailErrorMessage =
              "The email you've chosen is already in use. Please choose a different email.";
          }
        }
      );
    }
  }

  onChangePassword(): void {
    this.isChangingPassword = true;
  }

  onCancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordForm.reset();
    this.passwordError = '';
  }

  onSubmitNewPassword(): void {
    if (!this.currentUser) return;

    const { currentPassword, newPassword, confirmNewPassword } =
      this.passwordForm.value;

    // Validate form
    if (this.passwordForm.invalid) {
      this.passwordError = 'Please fill out all required fields correctly.';
      return;
    }

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }

    // Ensure user ID is a number and not undefined
    const userId = this.currentUser.id;
    if (userId === undefined) {
      console.error('User ID is undefined');
      this.passwordError = 'Unable to update password. User ID is missing.';
      return;
    }

    // Use the checkPassword method to verify current password
    this.userService.checkPassword(userId, currentPassword).subscribe({
      next: (isPasswordValid) => {
        if (!isPasswordValid) {
          this.passwordError =
            'Current password is incorrect. Please try again.';
          return;
        }

        // If password is valid, proceed with update
        const updatedUser: User = {
          ...this.currentUser!,
          password: newPassword,
        };

        this.userService.updateUser(userId, updatedUser).subscribe({
          next: () => {
            console.log('Password updated successfully.');
            this.userService.setCurrentUser(updatedUser);
            this.onCancelPasswordChange();
            this.toastr.success('Password updated successfully!');
          },
          error: (error) => {
            console.error('Error updating password:', error);
            this.toastr.error('Failed to update password. Please try again.');
          },
        });
      },
      error: (error) => {
        console.error('Error checking password:', error);
        this.passwordError =
          'An error occurred while verifying your current password.';
      },
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmNewPasswordVisibility() {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }

  private checkEmailAvailability(email: string): any {
    if (this.currentUser?.id !== undefined) {
      return this.userService.checkEmailAvailability(
        email,
        this.currentUser.id
      );
    }
    return of(false); // or handle the undefined case appropriately
  }

  private passwordValidator(control: { value: string }) {
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
