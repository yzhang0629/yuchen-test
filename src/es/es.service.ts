import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(private readonly esService: ElasticsearchService) {}

    async testConnection(): Promise<any[]> {
        try {
            await this.esService.ping();
            this.logger.log('Successfully connected to Elasticsearch.');

            const result = await this.esService.cat.indices({ format: 'json' });

            return result;
        } catch (error) {
            this.logger.error('Elasticsearch connection failed:', error);
            throw error;
        }
    }
    async searchUserById(id: string): Promise<any> {
        try {
            const result = await this.esService.get({
                index: 'hym_match_user',
                id
            });
            return result;
        } catch (error) {
            if (error.meta?.statusCode === 404) {
                throw new HttpException(`Document with ID ${id} not found`, HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException(
                    'Failed to fetch document from Elasticsearch',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    /*
    "new_entries": [
        {
            "role": "user",
            "content": "Sure, let's get started!"
        },
        {
            "role": "system",
            "content": "Great! What's your ideal first date?"
        },
        {
            "role": "user",
            "content": "Something casual, like grabbing coffee."
        }
    ]
    */
    async addChatHistory(id: string, chatHistory: any) {
        try {
            const result = await this.esService.update({
                index: 'hym_match_user',
                id,
                body: {
                    script: {
                        source: `
                            if (ctx._source.chat_history == null) {
                                ctx._source.chat_history = params.new_entries;
                            } else {
                                ctx._source.chat_history.addAll(params.new_entries);
                            }
                        `,
                        params: {
                            new_entries: chatHistory
                        }
                    }
                }
            });
            return result;
        } catch (error) {
            if (error.meta?.statusCode === 404) {
                throw new HttpException(`Document with ID ${id} not found`, HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException(
                    'Failed to update chat history in Elasticsearch',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}