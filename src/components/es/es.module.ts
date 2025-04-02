import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticSearchService } from './es.service';
import { ElasticSearchController } from './es.controller';
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
  providers: [ElasticSearchService],
  controllers: [ElasticSearchController],
  exports: [ElasticSearchService, ElasticsearchModule],
})
export class SearchModule {}