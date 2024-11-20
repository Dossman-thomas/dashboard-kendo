// update-button-renderer.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-update-button-renderer',
  template: `
    <button class="btn btn-primary" (click)="onClick()">Update</button>
  `
})
export class UpdateButtonRendererComponent {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  onClick() {
    // Open the modal, passing the user data
    this.params.context.componentParent.openModal(this.params.data);
  }
}
