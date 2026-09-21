import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CreateWorkspaceModalComponent } from './components/create-workspace-modal/create-workspace-modal.component';
import { KnowledgeBaseDocument, KnowledgeBaseItem, Workspace } from './data/interfaces.interface';
import { CreateFolderModalComponent } from './components/create-folder-modal/create-folder-modal.component';
import { UploadKnowledgeBaseModalComponent } from './components/upload-knowledge-base-modal/upload-knowledge-base-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('civiclens-web');
}
