import { Column, Entity } from "typeorm";
import { EntityBase } from "./base-entities/entity-base";
import { IAccountRequest, IAccountResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { randomUUID } from "crypto";
import { IToResponseBase } from "./abstractions/to-response-base";

@Entity('Account')
export class Account extends EntityBase implements IToResponseBase<Account, IAccountResponse> {

    @Column({ name: 'Name', type: 'nvarchar', unique: true })
    name!: string;

    @Column({ name: 'Code', type: 'nvarchar', unique: true })
    code!: string;

    @Column({ name: 'PhoneNo', type: 'nvarchar' })
    phoneNo!: string;

    @Column({ name: 'Email', type: 'nvarchar', unique: true })
    email!: string;

    @Column({ name: 'Address', type: 'nvarchar' })
    address!: string;

    @Column({ name: 'TemporaryAddress', type: 'nvarchar', nullable: true })
    temporaryAddress?: string;

    @Column({ name: 'ZipCode', type: 'int' })
    zipCode!: number;

    @Column({ name: 'Country', type: 'nvarchar' })
    country!: string;

    @Column({ name: 'State', type: 'nvarchar' })
    state!: string;

    @Column({ name: 'City', type: 'nvarchar' })
    city!: string;

    @Column({ name: 'Street', type: 'nvarchar' })
    street!: string;

    @Column({ name: 'Longitude', type: 'decimal' })
    longitude!: number;

    @Column({ name: 'Latitude', type: 'decimal' })
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
            this.createdBy = contextUser.name;
            this.createdAt = new Date();
            this.createdById = contextUser.id;
            this.active = true;
            this.deleted = false;
            this.id = randomUUID();
        }

        if(id && contextUser){
            this.id = id;
            this.modifiedBy = contextUser.name;
            this.modifiedAt = new Date();
            this.modifiedById = contextUser.id;
            this.active = true;
            this.deleted = false;
        }
        return this;
    }
}