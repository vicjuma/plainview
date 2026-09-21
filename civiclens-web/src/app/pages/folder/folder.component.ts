import { Component } from '@angular/core';
import { CreateFolderModalComponent } from '../../components/create-folder-modal/create-folder-modal.component';
import { KnowledgeBaseItem } from '../../data/interfaces.interface';

@Component({
  selector: 'app-folder',
  imports: [CreateFolderModalComponent],
  templateUrl: './folder.component.html',
  styleUrl: './folder.component.css',
})
export class FolderComponent {
  protected onFolderCreated(folder: KnowledgeBaseItem): void {
    console.log('Created Folder:', folder);
  }
}
