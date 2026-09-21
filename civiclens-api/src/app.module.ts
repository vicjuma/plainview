import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ChatApiModule } from './chat-api/chat-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    KnowledgeBaseModule,
    WorkspaceModule,
    ChatApiModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, Logger],
})
export class AppModule {}
