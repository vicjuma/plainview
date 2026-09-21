import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RawAxiosRequestHeaders } from 'axios';

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

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);
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

  async createWorkspace(
    data: CreateWorkspaceDto,
  ): Promise<CreateWorkspaceResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<CreateWorkspaceResponse>(
          `${this.baseUrl}/workspace/new`,
          data,
          {
            headers: this.headers,
          },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.logger.error(`Create workspace error: ${getErrorMessage(err)}`);

      throw new InternalServerErrorException('Failed to create workspace');
    }
  }

  findAll() {
    return `This action returns all workspace`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
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
