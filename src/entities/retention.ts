import { Schema, Types } from "mongoose";
import { IRetentionRequest, IRetentionResponse, ITokenUser, ResponseInput } from "../models";
import { documentToEntityMapper, modelCreator } from "../utility";
import { IToResponseBase } from "./abstractions/to-response-base";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { User } from "./user";

export class Retention extends AccountEntityBase implements IToResponseBase<Retention, IRetentionResponse> {
    retained!: number;
    appointments!: number;
    userId!: Types.ObjectId;
    startOfWeek!: Date;
    endOfWeek!: Date;
    week!: number;
    year!: number;
    user?: User;
    
    toInstance(): Retention {
        return documentToEntityMapper<Retention>(new Retention, this);
    }

    toEntity(entityRequest: IRetentionRequest, id?: string, contextUser?: ITokenUser): Retention {
        this.retained = entityRequest.retained;
        this.appointments = entityRequest.appointments;
        this.year = entityRequest.year;
        this.userId =  new Types.ObjectId(entityRequest.userId)
        this.week = entityRequest.week;
        this.startOfWeek = entityRequest.startOfWeek;
        this.endOfWeek = entityRequest.endOfWeek;
        if(contextUser && !id) {
            super.toAccountEntity(contextUser)
        }
        
        if(id && contextUser) {
            super.toAccountEntity(contextUser, id)
        }

        return this;
    }

    toResponse(entity?: ResponseInput<Retention> | undefined): IRetentionResponse {
        if(!entity) entity = this;
        return {
            ...this.toAccountResponseBase(entity), 
            retained: entity.retained,
            appointments: entity.appointments,
            week: entity.week,
            startOfWeek: entity.startOfWeek,
            endOfWeek: entity.endOfWeek,
            year: entity.year,
            userId: entity.userId.toString(),
            user: entity.user ? entity.user.toResponse(entity.user) : undefined,
        }
    }

}

const retentionSchema = new Schema<Retention>({
    retained: {type: Number, required: true},
    appointments: {type: Number, required: true},
    week: {type: Number, required: true},
    year: {type: Number, required: true},
    startOfWeek: {type: Date, required: true},
    endOfWeek: {type: Date, required: true},
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

retentionSchema.add(accountEntityBaseSchema)

retentionSchema.loadClass(Retention);

retentionSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

export const retentionModel = modelCreator<Retention, IRetentionResponse>('Retention', retentionSchema);