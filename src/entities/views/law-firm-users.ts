import { IlawFirmUsersResponse, ResponseInput } from "../../models";
import { Schema, Types } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../../utility";

export class LawFirmUsers {
    _id!: Types.ObjectId;
    userIds!: Array<Types.ObjectId>;

    toResponse(entity?: ResponseInput<LawFirmUsers>): IlawFirmUsersResponse {

        if(!entity) entity = this;

        return {
            id: entity._id.toString(),
            userIds: entity.userIds.map(userId => userId.toString()) ,
        }
    }

    toInstance (): LawFirmUsers {
        return documentToEntityMapper<LawFirmUsers>(new LawFirmUsers, this)
    }
    
}

export const lawFirmUsersSchema = new Schema<LawFirmUsers>({
    _id: { type: Schema.Types.ObjectId, required: true },
    userIds: [{ type: Types.ObjectId, ref: 'User', required: true }],
});




lawFirmUsersSchema.loadClass(LawFirmUsers);
export const lawFirmUsersModel = modelCreator<LawFirmUsers, IlawFirmUsersResponse>('LawFirmUsers', lawFirmUsersSchema);
