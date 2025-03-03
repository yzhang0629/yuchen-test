import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './es.service';


@Controller('search')
    export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Get('test-connection')
    async testConnection() {
        return await this.searchService.testConnection();
    }

    @Get('search-all-user')
    async searchUserById(@Query('id') id: string) {
        return await this.searchService.searchUserById(id);
    }
}