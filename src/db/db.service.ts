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

    async updateUser(userData: any[]): Promise<any> {
        const {firstName, lastName, email, gender, profileEntries} = parseInput(userData);
        const userNo = Date.now();      // User number needs to be specified?
        const currTime = new Date();
        const areaCode = '';
        const phoneNumber = '';
        const age = 0;
        const registerIp = '';
        const lastLoginIp = '';
        const subscriptionExpireTime = '2027-01-01 00:00:00';

        const sql = `
        INSERT INTO h_user (
            user_no,
            area_code,
            phone_number,
            email,
            first_name,
            last_name,
            age,
            gender,
            register_time,
            last_login_time,
            register_ip,
            last_login_ip,
            subscription_expire_time,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await this.pool.query(sql, [
            userNo,
            areaCode,
            phoneNumber,
            email,
            firstName,
            lastName,
            age,
            gender,
            currTime,
            currTime,
            registerIp,
            lastLoginIp,
            subscriptionExpireTime,
            currTime,
            currTime,
        ]);
        const insertedId = (result as any).insertId;

        const sqlAttribute = `
            INSERT INTO user_attribute (user_no, profile_key, profile_value, show_profile, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        for (const entry of profileEntries) {
            const { profile_key, profile_value } = entry;
            let profileValueStr: string;
            try {
                profileValueStr = JSON.stringify(profile_value);
            } catch (e) {
                profileValueStr = String(profile_value);
            }
            await this.pool.query(sqlAttribute, [
                userNo,
                profile_key,
                profileValueStr,
                1,
                currTime,
                currTime,
            ]);
        }
        return `id: ${insertedId}`;
    }

}

/*
Define a helper function that extracts the fields in the input
Assuming we are following the format in Kanghao's example:
[
  { "first_name": [] },
  { "last_name": [] },
  { "Email": [] },
  { "gender": [] },
  {
    "profile_key": "prompt",
    "profile_value": [
      {
        "id": "id1",
        "title": "Example Title",
        "text": "Example text",
        "readonly": false
      },
      {
        "id": "id2",
        "title": "Another Title",
        "text": "Another text"
      }
    ]
  },
  {
    "profile_key": "birthday",
    "profile_value": ["yyyy-mm-dd"]
  },
  {
    "profile_key": "height",
    "profile_value": []
  },
  {
    "profile_key": "sexuality",
    "profile_value": []
  },
  {
    "profile_key": "DatingtarGetPreferences",
    "profile_value": []
  },
  {
    "profile_key": "ethnicity",
    "profile_value": []
  },
  {
    "profile_key": "DatingPreferenceTag",
    "profile_value": []
  }
]
*/
function parseInput(user: any[]): {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    profileEntries: { profile_key: string; profile_value: any }[];
} {
    let firstName = '';
    let lastName = '';
    let email = '';
    let gender = '';
    const profileEntries: { profile_key: string; profile_value: any }[] = [];

    for (const entry of user) {
        if (entry.first_name !== undefined) firstName = entry.first_name.length > 0 ? entry.first_name : '';
        else if (entry.last_name !== undefined) lastName = entry.last_name.length > 0 ? entry.last_name : '';
        else if (entry.email !== undefined) email = entry.email.length > 0 ? entry.email : '';
        else if (entry.gender !== undefined) gender = entry.gender.length > 0 ? entry.gender : '';
        else if (entry.profile_key !== undefined && entry.profile_value !== undefined) {
            profileEntries.push({
                profile_key: String(entry.profileEntries.profile_key),
                profile_value: String(entry.profileEntries.profile_value),
            });
        }
    }

    return { firstName, lastName, email, gender, profileEntries }
}