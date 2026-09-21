import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  KnowledgeBaseDocument,
  UploadKnowledgeBaseResponse,
  Workspace,
} from '../../data/interfaces.interface';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

export interface ReturnedWorkspace {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  openAiTemp: number | null;
  lastUpdatedAt: string;
  openAiHistory: number;
  openAiPrompt: string | null;
  threads: unknown[];
}

@Component({
  selector: 'app-upload-knowledge-base-modal',
  imports: [],
  templateUrl: './upload-knowledge-base-modal.component.html',
  styleUrl: './upload-knowledge-base-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadKnowledgeBaseModalComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  @Output()
  protected readonly documentsUploaded = new EventEmitter<KnowledgeBaseDocument[]>();

  protected readonly loading = signal(false);

  protected readonly selectedFiles = signal<File[]>([]);

  protected readonly dragOver = signal(false);

  workspaces = signal<Workspace[]>([]);

  protected readonly selectedWorkspace = signal<Workspace | null>(null);

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.addFiles(Array.from(input.files));

    // Allows selecting the same file again after removing it.
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.dragOver.set(false);

    if (!event.dataTransfer?.files?.length) {
      return;
    }

    this.addFiles(Array.from(event.dataTransfer.files));
  }

  protected addFiles(files: File[]): void {
    this.selectedFiles.update((currentFiles) => {
      const existingKeys = new Set(currentFiles.map((file) => this.fileKey(file)));

      const newFiles = files.filter((file) => {
        const key = this.fileKey(file);

        if (existingKeys.has(key)) {
          return false;
        }

        existingKeys.add(key);
        return true;
      });

      return [...currentFiles, ...newFiles];
    });
  }

  protected removeFile(index: number): void {
    this.selectedFiles.update((files) => files.filter((_, fileIndex) => fileIndex !== index));
  }

  protected clearFiles(): void {
    this.selectedFiles.set([]);
  }

  protected selectWorkspace(workspace: Workspace): void {
    this.selectedWorkspace.set(workspace);
  }

  protected uploadDocuments(): void {
    const files = this.selectedFiles();

    if (!files.length) {
      this.toastr.warning(
        'Please select at least one document to upload.',
        'No Documents Selected',
      );

      return;
    }

    const workspace = this.selectedWorkspace();

    if (!workspace) {
      this.toastr.error(
        'Please select a workspace before uploading documents.',
        'Workspace Required',
      );

      return;
    }

    this.loading.set(true);

    this.apiService
      .uploadKnowledgeBaseDocuments(workspace.slug, files)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: UploadKnowledgeBaseResponse) => {
          console.log('Knowledge base upload response:', response);

          const uploadedDocuments = response.embedResult?.workspace?.documents ?? [];

          if (response.success) {
            this.toastr.success(
              response.description ||
                `${response.uploadedCount} document${
                  response.uploadedCount === 1 ? '' : 's'
                } uploaded & embedded successfully.`,
              'Documents Uploaded',
            );

            this.documentsUploaded.emit(uploadedDocuments);

            setTimeout(() => {
              this.clearFiles();
              this.router.navigate(['/vector-search']);
            }, 5000);

            return;
          }

          this.toastr.warning(
            response.description || 'Some documents could not be uploaded.',
            'Upload Completed with Issues',
          );

          if (uploadedDocuments.length) {
            this.documentsUploaded.emit(uploadedDocuments);
          }

          this.clearFiles();
        },

        error: (error) => {
          console.error('Failed to upload documents:', error);

          const message =
            error?.error?.message?.[0] ||
            error?.error?.message ||
            error?.error?.description ||
            'Unable to upload the documents. Please try again.';

          this.toastr.error(message, 'Document Upload Failed');
        },
      });
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / Math.pow(1024, unitIndex)).toFixed(1))} ${units[unitIndex]}`;
  }

  protected getFileExtension(fileName: string): string {
    const extension = fileName.split('.').pop();

    return extension ? extension.toUpperCase() : 'FILE';
  }

  private fileKey(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    this.apiService.getWorkspaces().subscribe({
      next: (res) => {
        this.workspaces.set(res.workspaces);
      },

      error: (error) => {
        console.error('Failed to load workspaces:', error);

        this.toastr.error('Unable to load workspaces. Please try again.', 'Workspaces Failed');
      },
    });
  }
}
