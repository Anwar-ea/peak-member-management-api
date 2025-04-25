import { Schema, Types } from "mongoose";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { IToResponseBase } from "./abstractions/to-response-base";
import { IVerificationResponse, ResponseInput } from "../models";
import { documentToEntityMapper, modelCreator } from "../utility";
import { User } from "./user";


export class Verification extends AccountEntityBase implements IToResponseBase<Verification, IVerificationResponse> {
    jwt?: string;
    expireTime!: Date;
    email!: string;
    userId!: Types.ObjectId;
    name!: string;
    OTP?: string;
    type!: 'ResetPassword';
    status!: 'Verified' | 'Expired' | 'Pending' | 'Delivered'
    user?: User;

    toInstance(): Verification {
        return documentToEntityMapper<Verification>(new Verification, this);
    };

    toResponse(entity?: ResponseInput<Verification> | undefined)  {
        if(!entity) entity = this;
        return {
            ...super.toAccountResponseBase(entity),
            jwt: entity.jwt,
            expireTime: entity.expireTime,
            email: entity.email,
            userId: entity.userId.toString(),
            name: entity.name,
            OTP: entity.OTP,
            type: entity.type,
            status: entity.status,
            user: entity.user ? entity.user.toResponse(entity.user) : undefined,
        }
    };
    
}


export const verificationSchema: Schema<Verification> = new Schema<Verification>({

    jwt: {
        type: String,
        required: false,
    },
    expireTime: {
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    OTP: {
        type: String,
        required: false,
        maxlength:6,
        minlength: 6
    }
});

verificationSchema.add(accountEntityBaseSchema)
verificationSchema.loadClass(Verification);
verificationSchema.virtual('User', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});
export const verificationModel = modelCreator<Verification, IVerificationResponse>('Verification', verificationSchema);