import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { config } from 'dotenv';
import { firstValueFrom } from 'rxjs';
import { Express } from 'express';
import axios from 'axios';
import OpenAI from 'openai';

config();

@Injectable()
export class DifyService {
    private readonly apiKey = process.env.DIFY_API_KEY;
    private readonly chatFlowUrl = process.env.DIFY_CHATFLOW_URL;
    private readonly chatURL = process.env.DIFY_CHAT;
    private readonly fileUrl = process.env.DIFY_FILE_URL;
    private readonly openaiClient = new OpenAI({
        organization: "org-bVyC8WWhjB6c8OIKFp73PhO7",
        apiKey: process.env.keyword
    });

    constructor(private readonly httpService: HttpService) {}

    /*
    Define a helper function that hard-codes get_profile, get_text_messages, 
    and get_audio into the other APIs
    For instance, whenever a user sends anything else than these three, then by default it is
    a regular chat message with the chatbot, it should return the result of querying get_text_messages.
    */
    async chatFlow(query: string, userId: string, response_mode : string, conversation_id?: string): Promise<any> {
        if (!this.apiKey || !this.chatFlowUrl) {
            throw new Error('DIFY_API_KEY or DIFY_CHATFLOW_URL is not set in the .env file');
        }
        if (!query || query.trim() == "") {
            query = "ignore this message, use the message in context";
        }

        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };

        const data = {
            inputs: {},
            query,
            user: userId,
            response_mode: response_mode,
            conversation_id,
        };

        try {
            const startTime = Date.now();
            const response = await firstValueFrom(
                this.httpService.post(this.chatFlowUrl, data, { headers })
            );
            
            if (query == "get_audio_message") {
                const audioUrl = response.data.answer.substring(response.data.answer.indexOf('(') + 1, response.data.answer.indexOf(')'));
                const gotUrl = Date.now();
                console.log("got audio:", gotUrl - startTime);
                const audioResponse = await firstValueFrom(
                    this.httpService.get(audioUrl, { responseType: 'arraybuffer' })
                );
                const gotBuffer = Date.now();
                console.log("got buffer:", gotBuffer - gotUrl);
                const audioFile = Buffer.from(audioResponse.data).toString('base64');
                const gotBase64 = Date.now();
                console.log("get_audio_message execution time: ", gotBase64 - gotBuffer);
                return audioFile;
            }
            const endTime = Date.now();
            // console.log("query execution time: ", endTime - startTime);
            return response.data.answer;
        } catch (error) {
            throw new HttpException(
                `Dify API request failed: ${error.message}`,
                error.response?.status || 500,
            );
        }
    }

    async getConversation(userId: string, conversationId: string): Promise<any> {
        if (!this.apiKey || !this.chatURL) {
            throw new Error('DIFY_API_KEY or DIFY_CHAT is not set in the .env file');
        }
    
        // Construct the URL with query parameters
        const conversationUrl = `${this.chatURL}?user=${userId}&conversation_id=${conversationId}`;
    
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
        };
    
        try {
            const response = await firstValueFrom(
                this.httpService.get(conversationUrl, { headers })
            );
            return response.data.data; // Return the conversation history
        } catch (error) {
            throw new HttpException(
                `Failed to retrieve conversation history: ${error.message}`,
                error.response?.status || 500,
            );
        }
    }

    async sendChatMessage(userId : string, query : string, response_mode : string, conversation_id ? : string) {
        const start = Date.now();
        if (query == "get_text_message" || query == "get_audio_message" || query == "get_profile") {
            return;
        }
        const response = await this.chatFlow(query, userId, response_mode, conversation_id);
        const gotResponse = Date.now();
        console.log("chatflow execution time: ", gotResponse - start);
        const reply = await this.chatFlow("get_text_message", userId, response_mode, conversation_id);
        const gotMessage = Date.now();
        console.log("get message execution time: ", gotMessage - gotResponse);
        const audio = await this.getAudio(reply);
        const gotAudio = Date.now();
        console.log("get audio execution time: ", gotAudio - gotMessage);
        console.log("content: ", audio);
        return reply;
    }

    async getRawMessages(userId: string, response_mode : string, conversationId: string) {
        const rawData = await this.chatFlow("get_chat_history", userId, response_mode, conversationId);

        return rawData;
    }

    async uploadFile(file: Express.Multer.File) {
        if (!this.apiKey || !this.fileUrl) {
            throw new Error('DIFY_API_KEY or DIFY_FILE_URL is not set in the .env file');
        }
        const uploadHeaders = {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data',
        };
        const blob = new Blob([file.buffer], { type: file.mimetype });
        const formData = new FormData();
        formData.append('file', blob, file.originalname);

        let uploadFileId: string;

        try {
            const uploadResponse = await firstValueFrom(
                this.httpService.post(this.fileUrl, formData, { headers: uploadHeaders })
            );
            uploadFileId = uploadResponse.data.id;
        } catch (error) {
            throw new HttpException(
                `Failed to upload audio file: ${error.message}`,
                error.response?.status || 500,
            );
        }
        return uploadFileId;
    }

    async sendAudioFile(userId: string, file: Express.Multer.File, response_mode : string, conversation_id?: string) {
        if (!this.apiKey || !this.chatFlowUrl) {
            throw new Error('DIFY_API_KEY or DIFY_CHATFLOW_URL is not set in the .env file');
        }
    
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    
        const fileId = await this.uploadFile(file);
        const chatData = {
            inputs: {},
            query: "This is my answer",
            response_mode: 'blocking',
            conversation_id: conversation_id || '',
            user: userId,
            files: [
                {
                    type: 'audio',
                    transfer_method: 'local_file',
                    upload_file_id: fileId,
                },
            ],
        };
        try {
            const chatResponse = await firstValueFrom(
                this.httpService.post(this.chatFlowUrl, chatData, { headers: headers })
            );
            console.log("chat response: ", chatResponse);
            const reply = await this.chatFlow("get_text_message", userId, response_mode, conversation_id);
            return reply;
        } catch (error) {
            throw new HttpException(
                `Failed to send chat message: ${error.message}`,
                error.response?.status || 500,
            );
        }
    }

    async getAudio(text: string): Promise<Buffer> {
        try {
            const response = await this.openaiClient.audio.speech.create({
                model: 'tts-1',
                voice: 'nova',
                input: text,
            });

            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            throw new HttpException(
                `Failed to generate audio: ${error.message}`,
                error.response?.status || 500,
            );
        }
    }
}