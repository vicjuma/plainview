import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import {
  CreateFolderPayload,
  CreateFolderResponse,
  KnowledgeBaseItem,
} from '../../data/interfaces.interface';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-folder-modal',
  imports: [FormField],
  templateUrl: './create-folder-modal.component.html',
  styleUrl: './create-folder-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateFolderModalComponent {
  private readonly apiService = inject(ApiService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);

  protected readonly folderModel = signal<CreateFolderPayload>({
    name: '',
  });

  protected readonly folderForm = form(this.folderModel, (s) => {
    required(s.name, {
      message: 'Folder name is required',
    });

    minLength(s.name, 2, {
      message: 'Folder name must be at least 2 characters',
    });

    maxLength(s.name, 100, {
      message: 'Folder name cannot exceed 100 characters',
    });
  });

  /**
   * Emits the newly created folder to the parent component.
   */
  @Output()
  protected readonly folderCreated = new EventEmitter<KnowledgeBaseItem>();

  protected createDocumentFolder(): void {
    if (this.folderForm().invalid()) {
      return;
    }

    const name = this.folderModel().name.trim();

    this.loading.set(true);

    const payload: CreateFolderPayload = {
      name,
    };

    this.apiService
      .createDocumentFolder(payload)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: CreateFolderResponse) => {
          console.log('Folder created:', response);

          this.toastr.success(
            response.message || `Folder "${name}" was created successfully.`,
            'Folder Created',
          );

          /**
           * The API response only contains success/message,
           * so construct the frontend folder item from the
           * name we submitted.
           */
          const folder: KnowledgeBaseItem = {
            name,
            type: 'folder',
            items: [],
          };

          this.folderCreated.emit(folder);

          setTimeout(() => {
            this.resetForm();
            this.router.navigate(['/upload-and-embed']);
          }, 5000);
        },

        error: (error) => {
          console.error('Failed to create folder:', error);

          const message =
            error?.error?.message?.[0] ||
            error?.error?.message ||
            'Unable to create the folder. Please try again.';

          this.toastr.error(message, 'Folder Creation Failed');
        },
      });
  }

  protected resetForm(): void {
    this.folderModel.set({
      name: '',
    });
  }
}
