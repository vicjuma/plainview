import { Component } from '@angular/core';
import { UploadKnowledgeBaseModalComponent } from '../../components/upload-knowledge-base-modal/upload-knowledge-base-modal.component';
import { KnowledgeBaseDocument } from '../../data/interfaces.interface';

@Component({
  selector: 'app-knowledge-base',
  imports: [UploadKnowledgeBaseModalComponent],
  templateUrl: './knowledge-base.component.html',
  styleUrl: './knowledge-base.component.css',
})
export class KnowledgeBaseComponent {
  protected onDocumentsUploaded(documents: KnowledgeBaseDocument[]): void {
    console.log('Uploaded documents:', documents);

    // Update your knowledge-base tree here.
  }
}
