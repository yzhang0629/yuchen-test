import { Controller, Get, Query } from "@nestjs/common";
import { VapiService } from "./vapi.service";

@Controller('vapi')
export class VapiController {
    constructor(private readonly vapiService: VapiService) {}
    @Get('getAllCalls')
    async getAllCalls() {
        return await this.vapiService.getAllCalls();
    }

    @Get('getCall')
    async getCall(
        @Query('id') id : string
    ) {
        return await this.vapiService.getCall(id);
    }

    @Get('getProfileFromCall')
    async getProfileFromCall(
        @Query('id') id : string
    ) {
        return await this.vapiService.getProfileFromCall(id);
    }

    @Get('getMessagesFromCall')
    async getMessagesFromCall(
        @Query('id') id : string
    ) {
        return await this.vapiService.getMessagesFromCall(id);
    }
    @Get('getFormattedMessagesFromCall')
    async getFormattedMessagesFromCall(
        @Query('id') id : string
    ) {
        return await this.vapiService.getFormattedMessagesFromCall(id);
    }
}