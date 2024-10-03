import { Schema, Types } from "mongoose";
import { IFinancialsRequest, IFinancialsResponse, ITokenUser, ResponseInput } from "../models";
import { documentToEntityMapper, modelCreator } from "../utility";
import { IToResponseBase } from "./abstractions/to-response-base";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { User } from "./user";

export class Financials extends AccountEntityBase implements IToResponseBase<Financials, IFinancialsResponse> {
    retentionRate!: number;
    annualGoal!: number;
    userId!: Types.ObjectId;
    year!: number;
    user?: User;
    toInstance(): Financials {
        return documentToEntityMapper<Financials>(new Financials, this);
    }

    toEntity(entityRequest: IFinancialsRequest, id?: string, contextUser?: ITokenUser): Financials {
        this.retentionRate = entityRequest.retentionRate;
        this.annualGoal = entityRequest.annualGoal;
        this.year = entityRequest.year;
        this.userId =  new Types.ObjectId(entityRequest.userId)
        if(contextUser && !id) {
            super.toAccountEntity(contextUser)
        }
        
        if(id && contextUser) {
            super.toAccountEntity(contextUser, id)
        }

        return this;
    }

    toResponse(entity?: ResponseInput<Financials> | undefined): IFinancialsResponse {
        if(!entity) entity = this;
        return {
            ...this.toAccountResponseBase(entity), 
            retentionRate: this.retentionRate,
            annualGoal: this.annualGoal,
            year: this.year,
            userId: this.userId.toString(),
            user: this.user? this.user.toResponse(this.user) : undefined,
        }
    }

}

const financialsSchema = new Schema<Financials>({
    retentionRate: {type: Number, required: true},
    annualGoal: {type: Number, required: true},
    year: {type: Number, required: true},
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

financialsSchema.add(accountEntityBaseSchema)

financialsSchema.loadClass(Financials);

financialsSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

export const financialsModel = modelCreator<Financials, IFinancialsResponse>('Finanials', financialsSchema);