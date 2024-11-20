import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-record',
  templateUrl: './create-record.component.html',
  styleUrls: ['../../styles.css', './create-record.component.css']
})
export class CreateRecordComponent implements OnInit {
  createUserForm: FormGroup;
  roles: string[] = ['admin', 'data manager', 'employee'];
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.createUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(15),
        this.passwordValidator
      ]]
    });
  }

  ngOnInit(): void {}

  onCreateUser(): void {
    if (this.createUserForm.valid) {
      const newUser: Omit<User, 'id'> = {
        name: this.createUserForm.value.name,
        email: this.createUserForm.value.email,
        role: this.createUserForm.value.role,
        password: this.createUserForm.value.password
      };
      
      // Call the service to create the user
      this.userService.createUser(newUser).subscribe({
        next: () => {
          console.log('User created successfully!');
          this.createUserForm.reset(); // Reset the form after submission
          this.redirectToDash();
        },
        error: (error) => {
          console.error('Error creating user:', error);
        }
      });
    }
  }
  

  redirectToDash(): void {
    this.router.navigate(['/dashboard']);
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
