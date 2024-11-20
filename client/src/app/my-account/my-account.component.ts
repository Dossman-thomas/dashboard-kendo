import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../services/user.service';
import { of } from 'rxjs';

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
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(15),
        this.passwordValidator
      ]],
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

      this.checkEmailAvailability(updatedUser.email).subscribe((isAvailable: boolean) => {
        if (isAvailable) {
          if (this.currentUser?.id !== undefined) {
            this.userService.updateUser(this.currentUser.id, updatedUser).subscribe({
              next: (user) => {
                console.log('User updated:', user);
                this.userService.setCurrentUser(user); // Update the current user in UserService
                alert('Your profile was updated successfully.');
                this.isEditing = false;
              },
              error: (error) => {
                console.error('Error updating user:', error);
              },
            });
          } else {
            console.error('User ID is undefined');
          }
        } else {
          this.emailErrorMessage = 'The email you\'ve chosen is already in use. Please choose a different email.';
        }
      });
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

    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;

    if (this.currentUser.password !== currentPassword) {
      this.passwordError = 'Current password is incorrect.';
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }

    const updatedUser: User = {
      ...this.currentUser,
      password: newPassword,
    };

    if (this.currentUser.id) {
      this.userService.updateUser(this.currentUser.id, updatedUser).subscribe({
        next: () => {
          console.log('Password updated successfully.');
          this.userService.setCurrentUser(updatedUser); // Update the current user in UserService
          this.onCancelPasswordChange();
          alert('Your password was updated successfully.');
        },
        error: (error) => {
          console.error('Error updating password:', error);
          this.passwordError = 'Failed to update password.';
        },
      });
    } else {
      console.error('User ID is undefined');
    }
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
      return this.userService.checkEmailAvailability(email, this.currentUser.id);
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