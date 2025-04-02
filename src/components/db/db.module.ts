import { Module } from "@nestjs/common";
import { DbController } from "./db.controller";
import { DbService } from "./db.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),],
  providers: [DbService],
  controllers: [DbController],
  exports: [DbService],
})
export class DbModule {}