import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { config } from 'dotenv';
import { firstValueFrom } from 'rxjs';
import { Express } from 'express';

config();

@Injectable()
export class DifyService {
    private readonly apiKey = process.env.DIFY_API_KEY;
    private readonly chatFlowUrl = process.env.DIFY_CHATFLOW_URL;
    private readonly chatURL = process.env.DIFY_CHAT;
    private readonly fileUrl = process.env.DIFY_FILE_URL;

    constructor(private readonly httpService: HttpService) {}

    /*
    Define a helper function that hard-codes get_profile, get_text_messages, 
    and get_audio into the other APIs
    For instance, whenever a user sends anything else than these three, then by default it is
    a regular chat message with the chatbot, it should return the result of querying get_text_messages.
    */
    async chatFlow(query: string, userId: string, conversation_id?: string): Promise<any> {
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
            response_mode: 'blocking',
            conversation_id,
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post(this.chatFlowUrl, data, { headers })
            );
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

    async sendChatMessage(userId : string, query : string, conversation_id ? : string) {
        if (query == "get_text_message" || query == "get_audio" || query == "get_profile") {
            return;
        }
        this.chatFlow(query, userId, conversation_id);
        const reply = await this.chatFlow("get_text_message", userId, conversation_id);
        return reply;
    }

    async getRawMessages(userId: string, conversationId: string) {
        const rawData = await this.getConversation(userId, conversationId);

        if (rawData == null || rawData.length === 0) return [];

        const result = rawData.reduce((ans, message) => {
            if (message.answer === "fill") {
                ans.push({
                    role: "user",
                    content: message.query
                });
            } else if (message.query === "get_text_message") {
                ans.push({
                    role: "assistant",
                    content: message.answer
                });
            }
            return ans;
        }, []);

        return result;
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

    async sendAudioFile(userId: string, file: Express.Multer.File, conversation_id?: string) {
        if (!this.apiKey || !this.chatFlowUrl) {
            throw new Error('DIFY_API_KEY or DIFY_CHATFLOW_URL is not set in the .env file');
        }
    
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    
        const fileId = await this.uploadFile(file);
        console.log(fileId);
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
            console.log(chatResponse.data.answer);
            const reply = await this.chatFlow("get_text_message", userId, conversation_id);
            return reply;
        } catch (error) {
            throw new HttpException(
                `Failed to send chat message: ${error.message}`,
                error.response?.status || 500,
            );
        }
    }
}