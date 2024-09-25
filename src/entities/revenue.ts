import { Schema, Types } from "mongoose";
import { IToResponseBase } from "./abstractions/to-response-base";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { User } from "./user";
import { IRevenueRequest, IRevenueResponse, ITokenUser, ResponseInput } from "../models";
import { documentToEntityMapper } from "../utility";
import { modelCreator } from "../utility/model-creator-utility";

export class Revenue extends AccountEntityBase implements IToResponseBase<Revenue, IRevenueResponse> {
    startOfWeek!: Date;
    endOfWeek!: Date;
    week!: number;
    year!: number;
    revenue!: number
    userId!: Types.ObjectId;
    user?: User;

    toResponse(entity?: ResponseInput<Revenue>): IRevenueResponse {
        if(!entity) entity = this;

        return {
            ...super.toAccountResponseBase(entity),
            startOfWeek: entity.startOfWeek,
            endOfWeek: entity.endOfWeek,
            week: entity.week,
            year: entity.year,
            revenue: entity.revenue,
            userId: entity.userId.toString(),
            user: entity.user ? entity.user.toResponse(entity.user) : undefined
        }
    }

    toInstance (): Revenue {
        return documentToEntityMapper<Revenue>(new Revenue, this)
    }
    
    toEntity(entityRequest: IRevenueRequest, id?: string, contextUser?: ITokenUser): Revenue {
        this.startOfWeek = entityRequest.startOfWeek;
        this.endOfWeek = entityRequest.endOfWeek;
        this.week = entityRequest.week;
        this.year = entityRequest.year;
        this.revenue = entityRequest.revenue;
        this.userId = new Types.ObjectId(entityRequest.userId);

        if(contextUser && !id) {
            super.toAccountEntity(contextUser)
        }
        
        if(id && contextUser) {
            super.toAccountEntity(contextUser, id)
        }

        return this;
    }
}

export const revenueSchema = new Schema<Revenue>({
    startOfWeek: { type: Date, required: true },
    endOfWeek: { type: Date, required: true },
    week: { type: Number, required: true },
    year: { type: Number, required: true },
    revenue: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

revenueSchema.add(accountEntityBaseSchema)

revenueSchema.loadClass(Revenue);

revenueSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

export const revenueModel = modelCreator<Revenue, IRevenueResponse>('Revenue', revenueSchema);