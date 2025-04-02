import { Module } from "@nestjs/common";
import { HttpModule } from '@nestjs/axios';
import { VapiService } from "./vapi.service";
import { VapiController } from "./vapi.controller";

@Module({
  imports: [HttpModule],
  controllers: [VapiController],
  providers: [VapiService],
  exports: [VapiService],
})
export class VapiModule {}