import { IRetentionRateRequest, IRetentionRateResponse, ITokenUser, ResponseInput } from "../models";
import { documentToEntityMapper } from "../utility";
import { IToResponseBase } from "./abstractions/to-response-base";
import { AccountEntityBase } from "./base-entities/account-entity-base";

export class RetentionRate extends AccountEntityBase implements IToResponseBase<RetentionRate, IRetentionRateResponse> {
    retentionRate!: number;

    toInstance(): RetentionRate {
        return documentToEntityMapper<RetentionRate>(new RetentionRate, this);
    }

    toEntity(entityRequest: IRetentionRateRequest, id?: string, contextUser?: ITokenUser): RetentionRate {
        this.retentionRate = entityRequest.retentionRate;

        if(contextUser && !id) {
            super.toAccountEntity(contextUser)
        }
        
        if(id && contextUser) {
            super.toAccountEntity(contextUser, id)
        }

        return this;
    }

    toResponse(entity?: ResponseInput<RetentionRate> | undefined): IRetentionRateResponse {
        if(!entity) entity = this;
        return {...this.toAccountResponseBase(entity), retentionRate: this.retentionRate}
    }

}
