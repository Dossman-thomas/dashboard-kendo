import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, take } from 'rxjs/operators';
import { PermissionsService, RolePermissions } from '../services/permissions.service';

@Component({
  selector: 'app-manage-permissions',
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.css']
})
export class ManagePermissionsComponent implements OnInit {
  rolePermissions$: Observable<RolePermissions[]>; // Observable for permissions data
  rolePermissions: RolePermissions[] = []; // Local copy to easily modify permissions

  constructor(private permissionsService: PermissionsService) {
    this.rolePermissions$ = this.permissionsService.getPermissions$().pipe(
      tap(permissions => (this.rolePermissions = permissions)) // Store permissions locally
    );
  }

  ngOnInit(): void {
    this.permissionsService.rolePermissions$.subscribe(permissions => {
      this.rolePermissions = permissions; // Update local permissions variable
      console.log('Current permissions:', this.rolePermissions); // Debugging log
    });
  }

  onPermissionChange(role: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    // Find the role to update and toggle the permission based on the checkbox
    const updatedRole = this.rolePermissions.find(rp => rp.role === role);
    if (updatedRole) {
      const updatedPermissions = {
        ...updatedRole,
        [checkbox.name]: checkbox.checked,
      };

      // Call update method in the service to sync with backend
      this.permissionsService.updatePermissions(role, updatedPermissions)
        .pipe(take(1)) // Complete the subscription after one response
        .subscribe(() => {
          console.log(`${role} permissions updated successfully`);

          // Update the local rolePermissions to reflect changes immediately
          this.rolePermissions = this.rolePermissions.map(rp =>
            rp.role === role ? updatedPermissions : rp
          );
        });
    }
  }
}
