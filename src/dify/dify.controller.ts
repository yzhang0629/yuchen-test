import { Controller, Post, Body, Get, Query } from '@nestjs/common';
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
    const response = await this.difyService.chatFlow(query, user, conversation_id);
    return response;
  }

  @Get('get-conversation')
  async getConversation(
    @Query('user') user: string,
    @Query('conversation_id') conversation_id: string
  ) {
    const response = await this.difyService.getConversation(user, conversation_id);
    return response;
  }
}