import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { config } from 'dotenv';

config()
@Injectable()
export class KibanaService {
    private readonly kibanaUrl: string;
    private readonly auth: { username: string; password: string };

    constructor(private readonly httpService: HttpService) {

        if (!process.env.KIBANA_URL || !process.env.KIBANA_USER_NAME || !process.env.PWD) {
            throw new Error('Missing required environment variables: KIBANA_URL, KIBANA_USER_NAME, or PWD');
        }
        this.kibanaUrl = process.env.KIBANA_URL;
        const userName = process.env.KIBANA_USER_NAME;
        const password = process.env.PWD;

        this.auth = {
            username: userName,
            password: password,
        };
    }

    // test connecting to Kibana and fetching data
    async searchTop3(): Promise<any> {
        try {
            const response = await this.httpService.post(
                this.kibanaUrl,
                {
                  params: {
                    index: 'hym_match_user',
                    body: {
                      size: 5,
                      query: {
                        match_all: {},
                      },
                    },
                  },
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'kbn-xsrf': 'true',
                  },
                  auth: this.auth,
                },
              ).toPromise();
        
              return response? response.data : {};
        } catch (error) {
            console.error('Error fetching from Kibana:', error.response?.data || error.message);
            throw error;
        }
    }
}