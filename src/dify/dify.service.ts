import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { config } from 'dotenv';
import { firstValueFrom } from 'rxjs';

config();

@Injectable()
export class DifyService {
    private readonly apiKey = process.env.DIFY_API_KEY;
    private readonly apiUrl = process.env.DIFY_CHATFLOW_URL;
    private readonly chatURL = process.env.DIFY_CHAT;

    constructor(private readonly httpService: HttpService) {}

    /*
    Define a helper function that hard-codes get_profile, get_text_messages, 
    and get_audio into the other APIs
    For instance, whenever a user sends anything else than these three, then by default it is
    a regular chat message with the chatbot, it should return the result of querying get_text_messages.
    */
    async chatFlow(query: string, userId: string, conversation_id?: string): Promise<any> {
        if (!this.apiKey || !this.apiUrl) {
            throw new Error('DIFY_API_KEY or DIFY_CHATFLOW_URL is not set in the .env file');
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
                this.httpService.post(this.apiUrl, data, { headers })
            );
            return response.data;
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
            return response.data; // Return the conversation history
        } catch (error) {
            throw new HttpException(
                `Failed to retrieve conversation history: ${error.message}`,
                error.response?.status || 500,
            );
        }
    }

}