import { EntityBase } from "./base-entities/entity-base";
import { IAccountRequest, IAccountResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { IToResponseBase } from "./abstractions/to-response-base";

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

    toResponse(entity: Account): IAccountResponse {
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
        }
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
        
        if(contextUser && !id){
            this.toBaseEntiy(contextUser);
        }

        if(id && contextUser){
            this.toBaseEntiy(contextUser, id);
        }
        return this;
    }
}