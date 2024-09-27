import { Schema, Types } from "mongoose";
import { IToResponseBase } from "./abstractions/to-response-base";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { User } from "./user";
import { ICallNoteRequest, ICallNoteResponse, ITokenUser, ResponseInput } from "../models";
import { documentToEntityMapper } from "../utility";
import { modelCreator } from "../utility/model-creator-utility";

export class CallNote extends AccountEntityBase implements IToResponseBase<CallNote, ICallNoteResponse> {
    note!: string;
    userId!: Types.ObjectId;
    user?: User;

    toResponse(entity?: ResponseInput<CallNote>): ICallNoteResponse {
        if(!entity) entity = this;

        return {
            ...super.toAccountResponseBase(entity),
            note: entity.note,
            userId: entity.userId.toString(),
            user: entity.user ? entity.user.toResponse(entity.user) : undefined
        }
    }

    toInstance (): CallNote {
        return documentToEntityMapper<CallNote>(new CallNote, this)
    }
    
    toEntity(entityRequest: ICallNoteRequest, id?: string, contextUser?: ITokenUser): CallNote {
        this.note = entityRequest.note;
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

export const callNoteSchema = new Schema<CallNote>({
    note: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

callNoteSchema.add(accountEntityBaseSchema)

callNoteSchema.loadClass(CallNote);

callNoteSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

export const callNoteModel = modelCreator<CallNote, ICallNoteResponse>('CallNote', callNoteSchema);