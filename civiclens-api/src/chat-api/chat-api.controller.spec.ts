import { Test, TestingModule } from '@nestjs/testing';
import { ChatApiController } from './chat-api.controller';
import { ChatApiService } from './chat-api.service';

describe('ChatApiController', () => {
  let controller: ChatApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatApiController],
      providers: [ChatApiService],
    }).compile();

    controller = module.get<ChatApiController>(ChatApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
