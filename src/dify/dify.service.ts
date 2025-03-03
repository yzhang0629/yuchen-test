import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { config } from 'dotenv';
import { firstValueFrom } from 'rxjs';

config();

@Injectable()
export class DifyService {
    private readonly apiKey = process.env.DIFY_API_KEY;
    private readonly apiUrl = process.env.DIFY_CHATFLOW_URL;

    constructor(private readonly httpService: HttpService) {}

    async startChatflow(query: string, userId: string, conversation_id?: string): Promise<any> {
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
}