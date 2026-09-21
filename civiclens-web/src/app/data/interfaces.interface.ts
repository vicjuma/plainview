export interface CreateWorkspacePayload {
  name: string;
  similarityThreshold: number;
  openAiTemp: number;
  openAiHistory: number;
  queryRefusalResponse: string;
  chatMode: string;
  topN: number;
  openAiPrompt: string;
}

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  vectorTag: string | null;
  createdAt: string;
  openAiTemp: number;
  openAiHistory: number;
  lastUpdatedAt: string;
  openAiPrompt: string;
  similarityThreshold: number;
  chatProvider: string | null;
  chatModel: string | null;
  topN: number;
  chatMode: string;
  pfpFilename: string | null;
  agentProvider: string | null;
  agentModel: string | null;
  queryRefusalResponse: string;
  vectorSearchMode: string;
  router_id: string | null;
}

export interface CreateWorkspaceResponse {
  workspace: Workspace;
  message: string | null;
}

export interface UploadKnowledgeBaseResponse {
  success: boolean;
  description: string | null;
  uploadedCount: number;
  failedCount: number;
  embedResult: {
    workspace: Workspace & {
      documents: KnowledgeBaseDocument[];
      contextWindow: number;
      currentContextTokenCount: number;
    };
  };
}
export interface KnowledgeBaseDocument {
  id: number;
  docId: string;
  filename: string;
  docpath: string;
  workspaceId: number;
  metadata: string;
  pinned: boolean;
  watched: boolean;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface CreateFolderPayload {
  name: string;
}
export interface CreateFolderResponse {
  success: boolean;
  message: string | null;
}

export interface KnowledgeBaseItem {
  name: string;
  type: 'folder' | 'file';
  items?: KnowledgeBaseItem[];

  // File-specific properties
  id?: string;
  url?: string;
  title?: string;
  docAuthor?: string;
  description?: string;
  docSource?: string;
  chunkSource?: string;
  published?: string;
  wordCount?: number;
  token_count_estimate?: number;
  cached?: boolean;
  canWatch?: boolean;
  pinnedWorkspaces?: string[];
  watched?: boolean;
}

export interface GetKnowledgeBaseDocumentsResponse {
  localFiles: KnowledgeBaseItem;
}

export interface GetFolderDocumentsResponse {
  folder: string;
  documents: KnowledgeBaseItem[];
  totalCount: number;
  hasMore: boolean;
  error: string | null;
}

export interface VectorSearchPayload {
  query: string;
  topN: number;
  scoreThreshold: number;
}

export interface VectorSearchMetadata {
  url: string;
  title: string;
  author: string;
  description: string;
  docSource: string;
  chunkSource: string;
  published: string;
  wordCount: number;
  tokenCount: number;
}

export interface VectorSearchResult {
  id: string;
  text: string;
  metadata: VectorSearchMetadata;
  distance: number;
  score: number;
}

export interface VectorSearchResponse {
  results: VectorSearchResult[];
}

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
