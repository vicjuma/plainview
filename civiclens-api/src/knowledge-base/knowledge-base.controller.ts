import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  GetWorkspacesResponse,
  KnowledgeBaseService,
  VectorSearchPayload,
} from './knowledge-base.service';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { CreateFolderDto } from './dto/create-folder.dto';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post('upload/:workspaceSlug')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'documents', maxCount: 50 }]))
  uploadAndEmbedFiles(
    @Param('workspaceSlug') workspaceSlug: string,
    @Body() createKnowledgeBaseDto: CreateKnowledgeBaseDto,
    @UploadedFiles()
    files: {
      documents?: Express.Multer.File[];
    },
  ) {
    console.log('DEBUG1');
    return this.knowledgeBaseService.uploadAndEmbedFiles(
      workspaceSlug,
      createKnowledgeBaseDto,
      files,
    );
  }

  @Get('documents')
  getDocuments() {
    return this.knowledgeBaseService.getDocuments();
  }

  @Get('documents/folder')
  getDocumentsInFolder(@Query('folder') folder: string) {
    return this.knowledgeBaseService.getDocumentsInFolder(folder);
  }

  @Get('documents/accepted')
  getDocumentTypes() {
    return this.knowledgeBaseService.getDocumentTypes();
  }

  @Post('create-folder')
  async createDocumentFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.knowledgeBaseService.createDocumentFolder(createFolderDto);
  }

  @Get('workspaces')
  async getWorkspaces(): Promise<GetWorkspacesResponse> {
    return this.knowledgeBaseService.getWorkspaces();
  }

  @Post('workspace/:workspaceSlug/vector-search')
  async vectorSearch(
    @Param('workspaceSlug') workspaceSlug: string,
    @Body() payload: VectorSearchPayload,
  ) {
    return this.knowledgeBaseService.vectorSearch(workspaceSlug, payload);
  }
}
