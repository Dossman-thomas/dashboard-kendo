import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { PermissionsService } from '../services/permissions.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-delete-button-renderer',
  template: `
    <button
      *ngIf="canDelete"
      (click)="onClick($event)"
      class="btn btn-danger"
      style="background-color: var(--secondary-red); border: none;">
      Delete
    </button>
  `
})
export class DeleteButtonRendererComponent implements ICellRendererAngularComp, OnInit {
  params: any;
  canDelete: boolean = false;

  constructor(
    private permissionsService: PermissionsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.permissionsService.getPermissionsForRole(currentUser.role).subscribe((permissions) => {
        this.canDelete = permissions ? permissions.canDelete : false;
        // console.log("DeleteButtonRenderer determined canDelete:", this.canDelete);
      });
    }
  }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }

  onClick($event: any) {
    if (this.canDelete && this.params.onClick instanceof Function) {
      const userId = this.params.data.id;
      this.params.onClick(userId);
    } else {
      alert('You do not have permission to delete this record.');
    }
  }
}
