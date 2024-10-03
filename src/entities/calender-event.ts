import { Schema, Types } from "mongoose";
import { IToResponseBase } from "./abstractions/to-response-base";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { User } from "./user";
import { ICalenderEventRequest, ICalenderEventResponse, ITokenUser, ResponseInput } from "../models";
import { documentToEntityMapper } from "../utility";
import { modelCreator } from "../utility/model-creator-utility";

export class CalenderEvent extends AccountEntityBase implements IToResponseBase<CalenderEvent, ICalenderEventResponse> {
    title!: string;
    detail!: string;
    eventDate!: Date;
    userId!: Types.ObjectId;
    user?: User;

    toResponse(entity?: ResponseInput<CalenderEvent>): ICalenderEventResponse {
        if(!entity) entity = this;

        return {
            ...super.toAccountResponseBase(entity),
            title: entity.title,
            detail: entity.detail,
            eventDate: entity.eventDate,
            userId: entity.userId.toString(),
            user: entity.user ? entity.user.toResponse(entity.user) : undefined
        }
    }

    toInstance (): CalenderEvent {
        return documentToEntityMapper<CalenderEvent>(new CalenderEvent, this)
    }
    
    toEntity(entityRequest: ICalenderEventRequest, id?: string, contextUser?: ITokenUser): CalenderEvent {
        this.title = entityRequest.title;
        this.detail = entityRequest.detail;
        this.eventDate = entityRequest.eventDate;
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

export const calenderEventSchema = new Schema<CalenderEvent>({
    title: { type: String, required: true },
    detail: { type: String, required: true },
    eventDate: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

calenderEventSchema.add(accountEntityBaseSchema)

calenderEventSchema.loadClass(CalenderEvent);

calenderEventSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

export const calenderEventModel = modelCreator<CalenderEvent, ICalenderEventResponse>('CalenderEvent', calenderEventSchema);