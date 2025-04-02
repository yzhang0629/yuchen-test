import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { config } from 'dotenv';
import { VapiClient } from "@vapi-ai/server-sdk";


config();
Injectable()
export class VapiService {
    private readonly VAPI_API_KEY = process.env.VAPI_API_KEY;
    constructor(private readonly httpService: HttpService) {}
    async getAllCalls(): Promise<any[]> {
        if (!this.VAPI_API_KEY) {
            throw new Error('VAPI_API_KEY is not set in the .env file');
        }
        try {
            const client = new VapiClient({ token: this.VAPI_API_KEY });
            const result = await client.calls.list();
            return result
        } catch (error) {
            throw new HttpException(
                `VAPI API request failed: ${error.message}`,
                error.response?.status || 500,
            );
        }
    }
    async getCall(call_id : string): Promise<any> {
        if (!this.VAPI_API_KEY) {
            throw new Error('VAPI_API_KEY is not set in the .env file');
        }
        try {
            const client = new VapiClient({ token: this.VAPI_API_KEY });
            const result = await client.calls.get(call_id);
            return result;
        } catch (error) {
            throw new HttpException(
                `VAPI API request failed: ${error.message}`,
                error.response?.status || 500,
            );
        }
    }

    async getProfileFromCall(call_id : string): Promise<any> {
        if (!this.VAPI_API_KEY) {
            throw new Error('VAPI_API_KEY is not set in the .env file');
        }
        try {
            const client = new VapiClient({ token: this.VAPI_API_KEY });
            const result = (await client.calls.get(call_id)).analysis?.structuredData;
            return result;
       } catch (error) {}
    }

    async getMessagesFromCall(call_id : string): Promise<any> {
        if (!this.VAPI_API_KEY) {
            throw new Error('VAPI_API_KEY is not set in the .env file');
        }
        try {
            const client = new VapiClient({ token: this.VAPI_API_KEY });
            const result = (await client.calls.get(call_id)).messages;
            return result;
       } catch (error) {}
    }

    async getFormattedMessagesFromCall(call_id : string): Promise<any> {
        const rawMessages = await this.getMessagesFromCall(call_id);
        
        interface Message {
            role: string;
            content: string;
        }
        const messages : Message[] = [];
        for (const message of rawMessages) {
            if (message.role === 'user') {
                messages.push({
                    role: 'user',
                    content: message.message || ""
                });
            } else if (message.role === 'bot') {
                messages.push({
                    role: 'assistant',
                    content: message.message || ""
                });
            }
        }
        return messages;
    }
}