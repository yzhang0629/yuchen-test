import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { DbController } from "src/components/db/db.controller";
import { DbService } from "src/components/db/db.service";
import { ElasticSearchController } from "src/components/es/es.controller";
import { ElasticSearchService } from "src/components/es/es.service";
import { VapiController } from "src/components/vapi/vapi.controller";
import { VapiService } from "src/components/vapi/vapi.service";
import { MainController } from "./main.controller";
import { MainService } from "./main.service";
import { VapiModule } from "src/components/vapi/vapi.module";
import { SearchModule } from "src/components/es/es.module";
import { DbModule } from "src/components/db/db.module";


@Module({
  imports: [HttpModule, VapiModule, SearchModule, DbModule],
  controllers: [MainController, VapiController, ElasticSearchController, DbController],
  providers: [MainService, VapiService, ElasticSearchService, DbService],
  exports: [MainService, VapiService, ElasticSearchService, DbService],
})
export class MainModule {}