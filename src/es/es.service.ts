import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { config } from 'dotenv';

config()
@Injectable()
export class KibanaService {
    private readonly kibanaUrl = process.env.KIBANA_URL || "";
    private readonly userName = process.env.KIBANA_USER_NAME || "";
    private readonly password = process.env.KIBANA_PWD || "";
    private readonly auth = {
        username: this.userName,
        password: this.password,
    };
    constructor(private readonly httpService: HttpService) {
        if (this.kibanaUrl == "" || this.userName == "" || this.password == "") {
            throw new Error('Kibana URL, user name, or password is not set.');
        }
    }
    async getUser(id: string): Promise<any> {
        try {
            const response = await this.httpService.post(
                this.kibanaUrl,
                {
                    params: {
                        index: 'hym_match_user',
                        body: {
                        size: 5,
                        query: {
                            term: {
                                _id: id,
                            },
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