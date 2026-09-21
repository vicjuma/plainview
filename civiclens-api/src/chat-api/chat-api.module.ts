import { Module } from '@nestjs/common';
import { ChatApiService } from './chat-api.service';
import { ChatApiController } from './chat-api.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [ChatApiController],
  providers: [ChatApiService, PrismaService],
})
export class ChatApiModule {}
