import { Component, signal } from '@angular/core';
import { CreateWorkspaceModalComponent } from '../../components/create-workspace-modal/create-workspace-modal.component';
import { Workspace } from '../../data/interfaces.interface';

@Component({
  selector: 'app-workspace',
  imports: [CreateWorkspaceModalComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css',
})
export class WorkspaceComponent {
  workspaces = signal<any>({})
  protected onWorkspaceCreated(workspace: Workspace): void {
    this.workspaces.set(workspace)
  }
}
