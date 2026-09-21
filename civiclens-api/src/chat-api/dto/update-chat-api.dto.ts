import { PartialType } from '@nestjs/mapped-types';
import { CreateChatApiDto } from './create-chat-api.dto';

export class UpdateChatApiDto extends PartialType(CreateChatApiDto) {}
