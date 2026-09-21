import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CreateFolderPayload,
  CreateFolderResponse,
  CreateWorkspacePayload,
  CreateWorkspaceResponse,
  GetFolderDocumentsResponse,
  GetKnowledgeBaseDocumentsResponse,
  ReturnedWorkspace,
  UploadKnowledgeBaseResponse,
  VectorSearchPayload,
  VectorSearchResponse,
  Workspace,
} from '../data/interfaces.interface';
import { Observable } from 'rxjs';
import { BASE_URL } from '../data/constants';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  createWorkspace(payload: CreateWorkspacePayload): Observable<CreateWorkspaceResponse> {
    return this.http.post<CreateWorkspaceResponse>(`${BASE_URL}/workspace/create`, payload);
  }

  /**
   * * Upload documents to a workspace knowledge base * Endpoint: POST /knowledge-base/upload/:workspaceSlug * *
   *  Request body: * documents: multiple file uploads */

  uploadKnowledgeBaseDocuments(
    workspaceSlug: string,
    documents: File[],
  ): Observable<UploadKnowledgeBaseResponse> {
    const formData = new FormData();
    documents.forEach((file) => {
      formData.append('documents', file);
    });
    return this.http.post<UploadKnowledgeBaseResponse>(
      `${BASE_URL}/knowledge-base/upload/${workspaceSlug}`,
      formData,
    );
  }

  /** * Create a new document folder * Endpoint: POST /api/v1/document/create-folder */

  createDocumentFolder(payload: CreateFolderPayload): Observable<CreateFolderResponse> {
    return this.http.post<CreateFolderResponse>(
      `${BASE_URL}/knowledge-base/create-folder`,
      payload,
    );
  }

  /**
   * Get knowledge base documents
   * Endpoint: GET /knowledge-base/documents
   */
  getKnowledgeBaseDocuments(): Observable<GetKnowledgeBaseDocumentsResponse> {
    return this.http.get<GetKnowledgeBaseDocumentsResponse>(`${BASE_URL}/knowledge-base/documents`);
  }

  /** Get documents inside a specific folder
   * Endpoint: GET /api/v1/documents/folder?folder=folderName
   */
  getFolderDocuments(folderName: string): Observable<GetFolderDocumentsResponse> {
    return this.http.get<GetFolderDocumentsResponse>(`${BASE_URL}/documents/folder`, {
      params: {
        folder: folderName,
      },
    });
  }

  /**
   * Perform vector search against a workspace
   * Endpoint: POST /api/v1/workspace/:workspaceSlug/vector-search
   */
  vectorSearch(
    workspaceSlug: string,
    payload: VectorSearchPayload,
  ): Observable<VectorSearchResponse> {
    return this.http.post<VectorSearchResponse>(
      `${BASE_URL}/knowledge-base/workspace/${encodeURIComponent(workspaceSlug)}/vector-search`,
      payload,
    );
  }

  getWorkspaces(): Observable<{ workspaces: Workspace[] }> {
    return this.http.get<{ workspaces: Workspace[] }>(`${BASE_URL}/knowledge-base/workspaces`);
  }

  searchChat(query: string): Observable<{ answers: string[] }> {
    return this.http.get<{ answers: string[] }>(`${BASE_URL}/chat-api`, {
      params: {
        q: query,
      },
    });
  }
}
