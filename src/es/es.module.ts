import { Module } from "@nestjs/common";
import { KibanaController } from "./es.controller";
import { KibanaService } from "./es.service";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [HttpModule],
    controllers: [KibanaController],
    providers: [KibanaService],
})
export class KibanaModule {}