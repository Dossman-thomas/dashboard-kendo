import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { PermissionsService, RolePermissions } from '../services/permissions.service';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Update with the correct path

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed: boolean = false;
  isAdmin: boolean = false;
  isDataManager: boolean = false;
  isVisible: boolean = false;
  showManageRecordsDropdown: boolean = false;

  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private userService: UserService, 
    private permissionsService: PermissionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      if (user) {  // Add a null check for user
        this.isAdmin = user.role === 'admin';
        this.isDataManager = user.role === 'data manager';
        this.isVisible = true;

        if (this.isAdmin || this.isDataManager) {
          // Load permissions based on the current user's role
          this.permissionsService.getPermissions$().subscribe(permissions => {
            const rolePermissions = permissions.find(rp => rp.role === user.role);
            if (rolePermissions) {
              this.canCreate = rolePermissions.canCreate;
              this.canUpdate = rolePermissions.canUpdate;
              this.canDelete = rolePermissions.canDelete;
            }
            this.cdr.detectChanges(); // Ensure changes are detected
          });
        }
      } else {
        this.isVisible = false;
      }
      
      this.cdr.detectChanges();
    });
  }

  get hasManageRecordsPermission(): boolean {
    return this.canCreate || this.canUpdate || this.canDelete;
  }
  
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleManageRecordsDropdown(): void {
    this.showManageRecordsDropdown = !this.showManageRecordsDropdown;
  }

  logout(): void {
    this.authService.logout();
  }
}
