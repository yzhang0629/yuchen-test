import { Controller, Get, Query } from "@nestjs/common";
import { KibanaService } from "./es.service";

@Controller('kibana')
export class KibanaController {
    constructor(private readonly kibanaService: KibanaService) {}
    @Get('getUser')
    async searchById(
        @Query('id') id:string
    ){
        return await this.kibanaService.getUser(id);
    }
}