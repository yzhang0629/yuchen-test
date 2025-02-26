import { Controller, Post, Body, Get } from '@nestjs/common';
import { DifyService } from './dify.service';

@Controller('chat')
export class DifyController {
  constructor(private readonly difyService: DifyService) {}

  @Post()
  async initiateChat(
    @Body('query') query: string, 
    @Body('user') user: string,
    @Body('conversation_id') conversation_id?: string
) {
    const response = await this.difyService.startChatflow(query, user, conversation_id);
    return response;
  }
}