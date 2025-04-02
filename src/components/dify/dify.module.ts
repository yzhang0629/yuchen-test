import { Module } from "@nestjs/common";
import { DifyController } from "./dify.controller";
import { DifyService } from "./dify.service";
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [DifyController],
  providers: [DifyService],
  exports: [DifyService, DifyController],
})
export class DifyModule {}