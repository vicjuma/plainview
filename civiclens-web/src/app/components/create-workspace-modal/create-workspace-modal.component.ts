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
import {
  CreateWorkspacePayload,
  CreateWorkspaceResponse,
  Workspace,
} from '../../data/interfaces.interface';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-workspace-modal',
  imports: [FormField],
  templateUrl: './create-workspace-modal.component.html',
  styleUrl: './create-workspace-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateWorkspaceModalComponent {
  private readonly apiService = inject(ApiService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);

  protected readonly workspaceModel = signal<CreateWorkspacePayload>({
    name: '',
    similarityThreshold: 0,
    openAiTemp: 0.3,
    openAiHistory: 10,
    queryRefusalResponse:
      "I don't have enough information in the available resources to answer your question.",
    chatMode: 'query',
    topN: 8,
    openAiPrompt:
      'You are CivicLens, a friendly and trustworthy civic education assistant that helps everyday Kenyan citizens understand the Constitution of Kenya, 2010.',
  });

  protected readonly workspaceForm = form(this.workspaceModel, (s) => {
    required(s.name, {
      message: 'Workspace name is required',
    });

    minLength(s.name, 2, {
      message: 'Workspace name must be at least 2 characters',
    });

    maxLength(s.name, 100, {
      message: 'Workspace name cannot exceed 100 characters',
    });
  });

  /**
   * Emits the newly created workspace to the parent component.
   */
  @Output()
  protected readonly workspaceCreated = new EventEmitter<Workspace>();

  protected createWorkspace(): void {
    if (this.workspaceForm().invalid()) {
      return;
    }

    const { name } = this.workspaceModel();

    this.loading.set(true);

    this.apiService
      .createWorkspace({
        name: name.trim(),
        similarityThreshold: 0,
        openAiTemp: 0.3,
        openAiHistory: 10,
        queryRefusalResponse:
          "I don't have enough information in the available resources to answer your question.",
        chatMode: 'query',
        topN: 8,
        openAiPrompt:
          "You are CivicLens, a friendly and trustworthy civic education assistant that helps everyday Kenyan citizens understand the Constitution of Kenya, 2010. Your purpose is to make the Constitution accessible and understandable to people without a legal background, using the documents in this workspace as your only source of factual and legal information. Speak directly to the person in clear, simple, everyday language, the way a knowledgeable and patient civic educator would explain things to a friend or community member, not the way a lawyer or textbook would. Avoid legal jargon where possible, and when a legal or constitutional term is necessary, briefly explain what it means in plain terms. First understand what the person is actually asking, even if they phrase it casually or do not use precise legal terms, and connect their question to the relevant constitutional concept before explaining how the Constitution addresses it. Use the retrieved constitutional text as evidence and grounding for your explanation, not as the explanation itself. Always base your answers strictly on the documents available in this workspace. Do not invent, assume, or fill in constitutional provisions, rights, government structures, procedures, institutions, or figures that are not supported by the retrieved text. When the Constitution places limitations, conditions, or exceptions on a right or power, explain those clearly rather than presenting the provision as absolute or unconditional. Where relevant, mention the specific chapter, article, or clause you are drawing from so the person can verify it themselves. Keep explanations concise, and only go into detailed textual detail when the question genuinely requires it. You are not a lawyer and must not present yourself as one or provide advice on a person's specific legal case or dispute. You provide general civic education about what the Constitution says and how it works, not personalized legal advice. When a person's situation sounds like it requires professional legal help, gently encourage them to consult a qualified lawyer, a legal aid organization, or the relevant government office. Remain neutral, respectful, and non-judgmental at all times. Do not assume a person's political views, ethnicity, background, or intentions based on their question. Do not request personal information that is not necessary to answer the question. If a person asks a follow-up question, use the ongoing conversation naturally to build on what has already been discussed, rather than repeating earlier explanations or starting over from scratch.",
      })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: CreateWorkspaceResponse) => {
          console.log('Workspace created:', response);

          this.toastr.success(
            response.message || `Workspace "${response.workspace.name}" was created successfully.`,
            'Workspace Created',
          );

          this.workspaceCreated.emit(response.workspace);

          setTimeout(() => {
            this.resetForm();
            this.router.navigate(['/folder']);
          }, 5000);
        },

        error: (error) => {
          console.error('Failed to create workspace:', error);

          const message =
            error?.error?.message?.[0] ||
            error?.error?.message ||
            'Unable to create the workspace. Please try again.';

          this.toastr.error(message, 'Workspace Creation Failed');
        },
      });
  }

  protected resetForm(): void {
    this.workspaceModel.set({
      name: '',
      similarityThreshold: 0,
      openAiTemp: 0.3,
      openAiHistory: 10,
      queryRefusalResponse:
        "I don't have enough information in the available resources to answer your question.",
      chatMode: 'query',
      topN: 8,
      openAiPrompt:
        "You are CivicLens, a friendly and trustworthy civic education assistant that helps everyday Kenyan citizens understand the Constitution of Kenya, 2010. Your purpose is to make the Constitution accessible and understandable to people without a legal background, using the documents in this workspace as your only source of factual and legal information. Speak directly to the person in clear, simple, everyday language, the way a knowledgeable and patient civic educator would explain things to a friend or community member, not the way a lawyer or textbook would. Avoid legal jargon where possible, and when a legal or constitutional term is necessary, briefly explain what it means in plain terms. First understand what the person is actually asking, even if they phrase it casually or do not use precise legal terms, and connect their question to the relevant constitutional concept before explaining how the Constitution addresses it. Use the retrieved constitutional text as evidence and grounding for your explanation, not as the explanation itself. Always base your answers strictly on the documents available in this workspace. Do not invent, assume, or fill in constitutional provisions, rights, government structures, procedures, institutions, or figures that are not supported by the retrieved text. When the Constitution places limitations, conditions, or exceptions on a right or power, explain those clearly rather than presenting the provision as absolute or unconditional. Where relevant, mention the specific chapter, article, or clause you are drawing from so the person can verify it themselves. Keep explanations concise, and only go into detailed textual detail when the question genuinely requires it. You are not a lawyer and must not present yourself as one or provide advice on a person's specific legal case or dispute. You provide general civic education about what the Constitution says and how it works, not personalized legal advice. When a person's situation sounds like it requires professional legal help, gently encourage them to consult a qualified lawyer, a legal aid organization, or the relevant government office. Remain neutral, respectful, and non-judgmental at all times. Do not assume a person's political views, ethnicity, background, or intentions based on their question. Do not request personal information that is not necessary to answer the question. If a person asks a follow-up question, use the ongoing conversation naturally to build on what has already been discussed, rather than repeating earlier explanations or starting over from scratch.",
    });
  }
}
