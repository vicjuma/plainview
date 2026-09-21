import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawAxiosRequestHeaders } from 'axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

export interface TextSearchPayload {
  message: string;
  mode: 'automatic' | 'query' | 'chat';
  sessionId: string;
  attachments?: TextSearchAttachment[];
  reset?: boolean;
}

export interface TextSearchAttachment {
  name: string;
  mime: string;
  contentString: string;
}

export interface TextSearchResponseItem {
  id: string;
  type: 'abort' | 'textResponseChunk';
  textResponse: string;
  sources: TextSearchSource[];
  close: boolean;
  error: string | null;
}

export interface TextSearchSource {
  title: string;
  chunk: string;
}

export type TextSearchResponse = TextSearchResponseItem[];

@Injectable()
export class ChatApiService {
  private readonly logger = new Logger(ChatApiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
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

  async textSearch(
    workspaceSlug: string,
    payload: TextSearchPayload,
  ): Promise<TextSearchResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<TextSearchResponse>(
          `${this.baseUrl}/v1/workspace/${encodeURIComponent(workspaceSlug)}/stream-chat`,
          payload,
          {
            headers: this.headers,
          },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.logger.error(`Text search error: ${getErrorMessage(err)}`);

      throw new InternalServerErrorException('Failed to perform text search');
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
