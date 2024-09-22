import { AccountEntityBase } from "./base-entities/account-entity-base";
import { IUserRequest, IUserResponse, UserStatus } from "../models";
import { Role } from "./role";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Types } from "mongoose";

export class User extends AccountEntityBase implements IToResponseBase<User, IUserResponse> {
    userName!: string;
    email!: string;
    passwordHash!: string;
    firstName!: string;
    middleName?: string;
    lastName!: string;
    pictureUrl?: string;
    dateOfBirth!: Date;
    firm?: string;
    position?: string;
    status!: UserStatus;
    lastLogin?: Date;
    lastOnline?: Date;
    roleId!: Types.ObjectId;

    role?: Role

    toResponse(entity: User): IUserResponse {
        return {
            ...super.toAccountResponseBase(entity),
            userName: entity.userName,
            email: entity.email,
            firstName: entity.firstName,
            middleName: entity.middleName,
            lastName: entity.lastName,
            pictureUrl: entity.pictureUrl,
            dateOfBirth: entity.dateOfBirth,
            status: entity.status,
            lastLogin: entity.lastLogin,
            lastOnline: entity.lastOnline,
            roleId: entity.roleId.toString(),
            firm: entity.firm,
            position: entity.position
        }    
    }

    
    toEntity = (requestEntity: IUserRequest, id?: string, contextUser?: ITokenUser): User => {
        this.userName = requestEntity.userName;
        this.email = requestEntity.email;
        this.firstName = requestEntity.firstName;
        this.middleName = requestEntity.middleName;
        this.lastName = requestEntity.lastName;
        this.dateOfBirth = requestEntity.dateOfBirth;
        this.roleId = new Types.ObjectId(requestEntity.roleId);
        this.pictureUrl = requestEntity.pictureUrl;
        this.firm = requestEntity.firm;
        this.position = requestEntity.position;

        if(contextUser && !id){
            this.toAccountEntity(contextUser)
        }

        if(id && contextUser){
            this.toAccountEntity(contextUser, id)
        }

        return this;
    }

}