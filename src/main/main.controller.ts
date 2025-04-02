import { Controller, Get, Query } from "@nestjs/common";
import { MainService } from "./main.service";

@Controller('main')
export class MainController {
    constructor(private readonly mainService: MainService) {}
    @Get('saveCallProfileToDb')
    async saveCallProfileToDb(
        @Query('id') id : string
    ) {
        return await this.mainService.saveCallProfileToDb(id);
    }
}