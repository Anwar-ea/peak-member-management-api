import { INotificationRequest, INotificationResponse, ITokenUser, NotificationTypes, ResponseInput } from "../models";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Schema } from "mongoose";
import { documentToEntityMapper } from "../utility";
import { modelCreator } from "../utility/model-creator-utility";

export class Notification extends AccountEntityBase implements IToResponseBase<Notification, INotificationResponse> {
    description!: string;
    type!: NotificationTypes;
    expirationDate!: Date;

    toResponse(entity?: ResponseInput<Notification>): INotificationResponse {
        if(!entity) entity = this;

        return {
            ...super.toAccountResponseBase(entity),
            description: entity.description,
            type: entity.type,
            expirationDate: entity.expirationDate
        }
    }

    toInstance (): Notification {
        return documentToEntityMapper<Notification>(new Notification, this)
    }
    
    toEntity (entityRequest: INotificationRequest, id?: string, contextUser?: ITokenUser): Notification  {
        this.description = entityRequest.description;
        this.type = entityRequest.type;
        this.expirationDate = entityRequest.expirationDate;

        if(contextUser && !id) {
            super.toAccountEntity(contextUser)
        }
        
        if(id && contextUser) {
            super.toAccountEntity(contextUser, id)
        }

        return this;
    }
}

export const notificationSchema = new Schema<Notification>({
    description: { type: String, required: true },
    type: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
});

notificationSchema.add(accountEntityBaseSchema)

notificationSchema.loadClass(Notification);

export const notificationModel = modelCreator<Notification, INotificationResponse>('Notifications', notificationSchema);