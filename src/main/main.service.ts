import { Injectable } from "@nestjs/common";
import { VapiService } from "../components/vapi/vapi.service";
import { DbService } from "../components/db/db.service";
import { ElasticSearchService } from "../components/es/es.service";

@Injectable()
export class MainService {
    constructor(
        private readonly vapiService: VapiService,
        private readonly dbService: DbService,
        private readonly esService: ElasticSearchService
    ) {}
    async saveCallProfileToDb(call_id : string) {
        try {
            const rawMessages = await this.vapiService.getProfileFromCall(call_id);
            return rawMessages;
        } catch (error) {
            
        }
    }
}