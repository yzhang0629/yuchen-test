import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { createPool, Pool } from "mysql2/promise";


config();
@Injectable()
export class DbService {
    private pool: Pool;
    constructor(private readonly configService : ConfigService) {}
    async onModuleInit() {
        this.pool = createPool({
            host: this.configService.get('DB_HOST'),
            user: this.configService.get('DB_USERNAME'),
            password: this.configService.get('DB_PASSWORD'),
            database: this.configService.get('DB_DATABASE'),
            port: this.configService.get('DB_PORT'),
            connectionLimit: 10
        });
        await this.pool.query('SELECT 1')
        console.log('MySQL pool created successfully');
    }
    async onModuleDestroy() {
        await this.pool.end();
        console.log('MySQL pool destroyed successfully');
    }

    async getTables(): Promise<any> {
        const [rows] = await this.pool.query('SHOW TABLES');
        return rows;
    }
}