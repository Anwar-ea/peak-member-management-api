import moment from "moment";
import { IIntuitCredsRequest, IIntuitCredsResponse, ITokenUser, ResponseInput } from "../models";
import { documentToEntityMapper, modelCreator } from "../utility";
import { IToResponseBase } from "./abstractions/to-response-base";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { User } from "./user";
import { Schema, Document, HydratedDocument, CallbackWithoutResultAndOptionalError, SaveOptions } from "mongoose";

export class IntuitCreds extends AccountEntityBase implements IToResponseBase<IntuitCreds, IIntuitCredsResponse> {

    accessToken?: string;
    refreshToken?: string;
    refreshTokenExpiry?: Date;
    accessTokenExpiry?: Date;
    status!: 'active' | 'expired';
    realmId!: string;
    userId!: string;
    user?: User;

    toResponse(entity?: ResponseInput<IntuitCreds>): IIntuitCredsResponse {
        entity = entity ?? this
        return {
            ...super.toAccountResponseBase(entity),
            accessToken: entity.accessToken,
            refreshToken: entity.refreshToken,
            refreshTokenExpiry: entity.refreshTokenExpiry,
            accessTokenExpiry: entity.accessTokenExpiry,
            realmId: entity.realmId,
            userId: entity.userId,
            user: entity.user ? entity.user.toResponse() : undefined,
            status: entity.status
        }
    };

    toInstance(): IntuitCreds {
        return documentToEntityMapper<IntuitCreds>(this, new IntuitCreds);
    };

    toEntity(entityRequest: IIntuitCredsRequest, contextUser?: ITokenUser): IntuitCreds {
        if (contextUser) this.toAccountEntity(contextUser);
        this.accessToken = entityRequest.accessToken;
        this.refreshToken = entityRequest.refreshToken;
        this.accessTokenExpiry = moment().add(entityRequest.accessTokenExpiry, 'seconds').toDate();
        this.refreshTokenExpiry = moment().add(entityRequest.refreshTokenExpiry, 'seconds').toDate();
        this.realmId = entityRequest.realmId;
        this.status = 'active';
        this.userId = entityRequest.userId;
        return this
    }

    checkExpiaryStatus(tokenType: 'accessToken' | 'refreshToken'): boolean {
        if (tokenType === 'accessToken' && this.accessToken) return moment().isBefore(this.accessTokenExpiry);
        if (tokenType === 'refreshToken' && this.refreshToken) return moment().isAfter(this.refreshTokenExpiry);
        return false;
    }
}

export const IntuitCredsSchema = new Schema<IntuitCreds>({
    accessToken: {type: String, required: false},
    refreshToken: {type: String, required: false},
    refreshTokenExpiry: {type: Date, required: false},
    accessTokenExpiry: {type: Date, required: false},
    status: {type: String, enum: ['active', 'expired'], required: true},
    realmId: {type: String, required: true},
    userId: {type: String, required: true, unique: true},
})

IntuitCredsSchema.add(accountEntityBaseSchema);
IntuitCredsSchema.loadClass(IntuitCreds);

IntuitCredsSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
})

IntuitCredsSchema.pre<IntuitCreds>('save', async function(next){
    if(this.accessToken && this.refreshToken && this.refreshTokenExpiry && this.accessTokenExpiry) this.status = 'active';
    else this.status = 'expired';
    next();
})

export const IntuitCredsModel = modelCreator<IntuitCreds, IIntuitCredsResponse>('IntuitCreds', IntuitCredsSchema);




