import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './es.service';
import { SearchController } from './es.controller';
import { config } from 'dotenv';

config();
@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ES_NODE,
      auth: {
        username: process.env.ES_USERNAME || "",
        password: process.env.ES_PASSWORD || "",
      },
    }),
  ],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}