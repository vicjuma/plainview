import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-text-search',
  imports: [FormField],
  templateUrl: './text-search.component.html',
  styleUrl: './text-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextSearchComponent {
  private readonly apiService = inject(ApiService);
  private readonly toastr = inject(ToastrService);

  protected readonly loading = signal(false);

  protected readonly searchModel = signal({
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

  protected readonly results = signal<string[]>([]);

  protected search(): void {
    if (this.searchForm().invalid()) {
      return;
    }

    const query = this.searchModel().query.trim();

    this.loading.set(true);
    this.results.set([]);

    this.apiService
      .searchChat(query)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.results.set(response.answers ?? []);

          if (!response.answers?.length) {
            this.toastr.info('No matching answers were found.', 'Search Complete');
          }
        },

        error: (error) => {
          console.error('Text search failed:', error);

          this.toastr.error(
            error?.error?.message || 'Unable to perform text search. Please try again.',
            'Search Failed',
          );
        },
      });
  }

  protected resetSearch(): void {
    this.searchModel.set({
      query: '',
    });

    this.results.set([]);
  }
}
