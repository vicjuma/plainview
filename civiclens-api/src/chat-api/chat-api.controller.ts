import { Body, Controller, Param, Post } from '@nestjs/common';
import { ChatApiService, TextSearchPayload } from './chat-api.service';

@Controller('chat-api')
export class ChatApiController {
  constructor(private readonly chatApiService: ChatApiService) {}

  @Post('text-search')
  textSearch(
    @Param('workspaceSlug') workspaceSlug: string,
    @Body() payload: TextSearchPayload,
  ) {
    return this.chatApiService.textSearch(workspaceSlug, payload);
  }
}
