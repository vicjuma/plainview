import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';
import { form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import {
  VectorSearchPayload,
  VectorSearchResponse,
  VectorSearchResult,
  Workspace,
} from '../../data/interfaces.interface';

@Component({
  selector: 'app-vector-search',
  imports: [FormField],
  templateUrl: './vector-search.component.html',
  styleUrl: './vector-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VectorSearchComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly toastr = inject(ToastrService);
  workspaces = signal<Workspace[]>([]);
  @Input({ required: true })
  workspaceSlug!: string;

  protected readonly loading = signal(false);
  protected readonly selectedWorkspace = signal<Workspace | null>(null);

  protected selectWorkspace(workspace: Workspace): void {
    this.selectedWorkspace.set(workspace);
  }

  protected readonly searchModel = signal<Pick<VectorSearchPayload, 'query'>>({
    query: '',
  });

  protected readonly searchForm = form(this.searchModel, (s) => {
    required(s.query, {
      message: 'Search query is required',
    });

    minLength(s.query, 2, {
      message: 'Search query must be at least 2 characters',
    });

    maxLength(s.query, 500, {
      message: 'Search query cannot exceed 500 characters',
    });
  });

  protected readonly results = signal<VectorSearchResult[]>([]);

  protected search(): void {
    if (this.searchForm().invalid()) {
      return;
    }

    const query = this.searchModel().query.trim();

    const workspace = this.selectedWorkspace();

    if (!workspace) {
      this.toastr.error('Please select a workspace before searching.', 'Workspace Required');
      return;
    }

    const payload: VectorSearchPayload = {
      query,
      topN: 8,
      scoreThreshold: 0,
    };

    this.loading.set(true);
    this.results.set([]);

    this.apiService
      .vectorSearch(workspace.slug, payload)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: VectorSearchResponse) => {
          this.results.set(response.results ?? []);

          if (!response.results?.length) {
            this.toastr.info('No matching documents were found.', 'Search Complete');
          }
        },

        error: (error) => {
          console.error('Vector search failed:', error);

          const message =
            error?.error?.message?.[0] ||
            error?.error?.message ||
            'Unable to perform vector search. Please try again.';

          this.toastr.error(message, 'Vector Search Failed');
        },
      });
  }

  protected resetSearch(): void {
    this.searchModel.set({
      query: '',
    });

    this.results.set([]);
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
