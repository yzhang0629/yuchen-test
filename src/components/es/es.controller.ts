import { Controller, Get, Query } from '@nestjs/common';
import { ElasticSearchService } from './es.service';


@Controller('search')
    export class ElasticSearchController {
    constructor(private readonly searchService: ElasticSearchService) {}

    @Get('test-connection')
    async testConnection() {
        return await this.searchService.testConnection();
    }

    @Get('search-all-user')
    async searchUserById(@Query('id') id: string) {
        return await this.searchService.searchUserById(id);
    }
}