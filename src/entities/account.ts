import { EntityBase, entityBaseSchema } from "./base-entities/entity-base";
import { IAccountRequest, IAccountResponse, ResponseInput } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { IToResponseBase } from "./abstractions/to-response-base";
import { documentToEntityMapper, modelCreator } from "../utility";
import { Schema } from "mongoose";

export class Account extends EntityBase implements IToResponseBase<Account, IAccountResponse> {
    name!: string;
    code!: string;
    phoneNo!: string;
    email!: string;
    address!: string;
    temporaryAddress?: string;
    zipCode!: number;
    country!: string;
    state!: string;
    city!: string;
    street!: string;
    longitude!: number;
    latitude!: number;
    retentionRate?: number;

    toResponse(entity?: ResponseInput<Account>): IAccountResponse {
        if(!entity) entity = this;
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
            phoneNo: entity.phoneNo,
            email: entity.email,
            address: entity.address,
            temporaryAddress: entity.temporaryAddress,
            zipCode: entity.zipCode,
            country: entity.country,
            state: entity.state,
            city: entity.city,
            street: entity.street,
            longitude: entity.longitude,
            latitude: entity.latitude,
            retentionRate: entity.retentionRate,
        }
    }

    toInstance(): Account {
        return documentToEntityMapper<Account>(new Account(), this)
    }

    toEntity = (requestEntity: IAccountRequest, id?: string, contextUser?: ITokenUser): Account => {
        this.name = requestEntity.name;
        this.code = requestEntity.code;
        this.phoneNo = requestEntity.phoneNo;
        this.email = requestEntity.email;
        this.address = requestEntity.address;
        this.temporaryAddress = requestEntity.temporaryAddress;
        this.zipCode = requestEntity.zipCode;
        this.country = requestEntity.country;
        this.state = requestEntity.state;
        this.city = requestEntity.city;
        this.street = requestEntity.street;
        this.longitude = requestEntity.longitude;
        this.latitude = requestEntity.latitude;
        this.retentionRate = requestEntity.retentionRate;
        if(contextUser && !id){
            this.toBaseEntiy(contextUser);
        }

        if(id && contextUser){
            this.toBaseEntiy(contextUser, id);
        }
        return this;
    }
}

export const accountSchema = new Schema<Account>({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true},
    address: { type: String, required: true },
    temporaryAddress: { type: String },
    zipCode: { type: Number, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    retentionRate: { type: Number, required: false },
});


accountSchema.add(entityBaseSchema);
accountSchema.loadClass(Account);

export const accountModel = modelCreator<Account, IAccountResponse>('Account' ,accountSchema)