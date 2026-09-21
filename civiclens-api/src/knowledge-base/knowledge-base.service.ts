import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { CreateFolderDto } from './dto/create-folder.dto';

interface UploadDocumentResponse {
  success: boolean;
  documents?: Array<{
    location: string;
  }>;
}

export interface DocumentsResponse {
  localFiles: {
    name: string;
    type: string;
    items: unknown[];
  };
}

export interface EmbedDocumentsResponse {
  success?: boolean;
  [key: string]: unknown;
}

export interface DocumentTypesResponse {
  types: Record<string, string[]>;
}

export interface CreateWorkspaceRequest {
  name: string;
  similarityThreshold?: number;
  openAiTemp?: number;
  openAiHistory?: number;
  openAiPrompt?: string;
  queryRefusalResponse?: string;
  chatMode?: string;
  topN?: number;
}

export interface CreateWorkspaceResponse {
  workspace: {
    id: number;
    name: string;
    slug: string;
    createdAt: string;
    openAiTemp: number | null;
    lastUpdatedAt: string;
    openAiHistory: number;
    openAiPrompt: string | null;
  };
  message: string;
}

export interface CreateFolderResponse {
  success: boolean;
  message: string | null;
}

export interface WorkspaceResponse {
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

export interface GetWorkspacesResponse {
  workspaces: WorkspaceResponse[];
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

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>(
      'ANYTHINGLLM_BASE_URL',
    );

    this.apiKey = this.configService.getOrThrow<string>('ANYTHINGLLM_API_KEY');
  }

  private get headers(): RawAxiosRequestHeaders {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private async uploadDocument(
    file: Express.Multer.File,
    workspaceSlug: string,
  ): Promise<string | null> {
    const form = new FormData();

    const arrayBuffer = new ArrayBuffer(file.buffer.byteLength);

    new Uint8Array(arrayBuffer).set(file.buffer);

    const blob = new Blob([arrayBuffer], {
      type: file.mimetype,
    });

    form.append('file', blob, file.originalname);

    try {
      const response: AxiosResponse<UploadDocumentResponse> =
        await firstValueFrom(
          this.httpService.post<UploadDocumentResponse>(
            `${this.baseUrl}/document/upload/${workspaceSlug}`,
            form,
            {
              headers: {
                ...this.headers,
              },
              maxBodyLength: Infinity,
              maxContentLength: Infinity,
            },
          ),
        );

      const data = response.data;

      if (data.success && data.documents?.[0]?.location) {
        this.logger.log(`Uploaded: ${file.originalname}`);

        return data.documents[0].location;
      }

      this.logger.warn(
        `Failed: ${file.originalname} — ${JSON.stringify(data)}`,
      );

      return null;
    } catch (err: unknown) {
      this.logger.error(
        `Upload error for ${file.originalname}: ${getErrorMessage(err)}`,
      );

      return null;
    }
  }

  cr;

  private async embedDocuments(
    workspaceSlug: string,
    locations: string[],
  ): Promise<EmbedDocumentsResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<EmbedDocumentsResponse>(
          `${this.baseUrl}/workspace/${workspaceSlug}/update-embeddings`,
          {
            adds: locations,
          },
          {
            headers: this.headers,
          },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.logger.error(`Embedding error: ${getErrorMessage(err)}`);

      throw new InternalServerErrorException('Failed to embed documents');
    }
  }

  async uploadAndEmbedFiles(
    workspaceSlug: string,
    uploadDocumentsDto: CreateKnowledgeBaseDto,
    files: {
      documents?: Express.Multer.File[];
    },
  ) {
    const documents = files.documents ?? [];

    if (documents.length === 0) {
      throw new NotFoundException('No documents were provided');
    }

    const uploadedLocations = (
      await Promise.all(
        documents.map((file) => this.uploadDocument(file, workspaceSlug)),
      )
    ).filter((location): location is string => location !== null);

    if (uploadedLocations.length === 0) {
      return {
        success: false,
        message: 'No documents were uploaded successfully',
      };
    }

    const embedResult = await this.embedDocuments(
      workspaceSlug,
      uploadedLocations,
    );

    return {
      success: true,
      description: uploadDocumentsDto.description ?? null,
      uploadedCount: uploadedLocations.length,
      failedCount: documents.length - uploadedLocations.length,
      embedResult,
    };
  }

  async getDocuments(): Promise<DocumentsResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<DocumentsResponse>(`${this.baseUrl}/documents`, {
          headers: this.headers,
        }),
      );

      return response.data;
    } catch (err: unknown) {
      this.logger.error(`Get documents error: ${getErrorMessage(err)}`);

      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  async getDocumentsInFolder(folder: string): Promise<DocumentsResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<DocumentsResponse>(
          `${this.baseUrl}/documents/${folder}`,
          {
            headers: this.headers,
          },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.logger.error(`Get documents error: ${getErrorMessage(err)}`);

      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  async getDocumentTypes(): Promise<DocumentTypesResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<DocumentTypesResponse>(
          `${this.baseUrl}/document/accepted-file-types`,
          {
            headers: this.headers,
          },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.logger.error(`Get document types error: ${getErrorMessage(err)}`);

      throw new InternalServerErrorException('Failed to fetch document types');
    }
  }

  async createDocumentFolder(
    createFolderDto: CreateFolderDto,
  ): Promise<CreateFolderResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<CreateFolderResponse>(
          `${this.baseUrl}/document/create-folder`,
          {
            name: createFolderDto.name.trim(),
          },
          {
            headers: this.headers,
          },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.logger.error(
        `Create document folder error: ${getErrorMessage(err)}`,
      );

      throw new InternalServerErrorException(
        'Failed to create document folder',
      );
    }
  }

  async getWorkspaces(): Promise<GetWorkspacesResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<GetWorkspacesResponse>(
          `${this.baseUrl}/workspaces`,
          {
            headers: this.headers,
          },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.logger.error(`Get workspaces error: ${getErrorMessage(err)}`);

      throw new InternalServerErrorException('Failed to fetch workspaces');
    }
  }

  async vectorSearch(
    workspaceSlug: string,
    payload: VectorSearchPayload,
  ): Promise<VectorSearchResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<VectorSearchResponse>(
          `${this.baseUrl}/workspace/${encodeURIComponent(workspaceSlug)}/vector-search`,
          payload,
          {
            headers: this.headers,
          },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.logger.error(`Vector search error: ${getErrorMessage(err)}`);

      throw new InternalServerErrorException('Failed to perform vector search');
    }
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return JSON.stringify(error);
}
