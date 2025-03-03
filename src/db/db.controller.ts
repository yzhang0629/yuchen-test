import { Body, Controller, Get, Post } from "@nestjs/common";
import { DbService } from "./db.service";

@Controller('db')
export class DbController {
    constructor(private readonly dbService: DbService) {}
    @Get('table-names')
    async getTableNames() {
        return this.dbService.getTables();
    }

    @Post('update-user')
    async updateUser(@Body() user : any[]) {
        return this.dbService.updateUser(user);
    }
}