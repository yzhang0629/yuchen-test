import { Controller, Get } from "@nestjs/common";
import { KibanaService } from "./es.service";

@Controller('kibana')
export class KibanaController {
    constructor(private readonly kibanaService: KibanaService) {}
    @Get('top3')
    async searchTop3(){
        return await this.kibanaService.searchTop3();
    }
}