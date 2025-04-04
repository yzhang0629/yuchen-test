import { Controller, Post, Body, Get, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { DifyService } from './dify.service';
import { Multer } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chat')
export class DifyController {
  constructor(private readonly difyService: DifyService) {}

  @Post()
  async chatFlow(
    @Body('query') query: string, 
    @Body('user') user: string,
    @Body('response_mode') response_mode: string,
    @Body('conversation_id') conversation_id?: string
) {
    const response = await this.difyService.chatFlow(query, user, response_mode, conversation_id);
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

  @Post('send-message')
  async sendChatMessage(
    @Body('user') user: string,
    @Body('message') message: string,
    @Body('response_mode') response_mode: string,
    @Body('conversation_id') conversation_id: string
  ) {
    const response = await this.difyService.sendChatMessage(user, message, response_mode, conversation_id);
    return response;
  }

  @Get('get-messages')
  async getRawMessages(
    @Query('user') user: string,
    @Query('response_mode') response_mode: string,
    @Query('conversation_id') conversation_id: string
  ) {
    const response = await this.difyService.getRawMessages(user, response_mode, conversation_id);
    return response;
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('audio'))
  async sendAudio(
    @UploadedFile() audio: Express.Multer.File,
  ) {
    const response = await this.difyService.uploadFile(audio);
    return response;
  }

  @Post('send-audio')
  @UseInterceptors(FileInterceptor('file'))
  async sendAudioFile(
    @Body('user') user: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('response_mode') response_mode: string,
    @Body('conversation_id') conversation_id?: string
  ) {
    const response = await this.difyService.sendAudioFile(user, file, response_mode, conversation_id);
    return response;
  }
}