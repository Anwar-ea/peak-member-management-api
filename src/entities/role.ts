import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Privilege } from "./privilege";
import { IRoleRequest, IRoleResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { EntityBase } from "./base-entities/entity-base";
import { Account } from "./account";
import { randomUUID } from "crypto";
import { IToResponseBase } from "./abstractions/to-response-base";
import { User } from "./user";
import { Types } from "mongoose";

@Entity('Role')
export class Role extends EntityBase implements IToResponseBase<Role, IRoleResponse> {
    name!: string;
    code!: string;
    privilegeIds!: Array<Types.ObjectId>;
    accountId?: Types.ObjectId;
    account?: Account | undefined
    privileges?: Array<Privilege>;
    
    toResponse(entity: Role): IRoleResponse {
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
            privilages: entity.privileges ? entity.privileges.map(prv => prv.toResponse(prv)) : undefined
        }    
    }

    toEntity = (entityRequest: IRoleRequest, id?: string, contextUser?: ITokenUser): Role => {
        this.name = entityRequest.name;
        this.code = entityRequest.code;
        if(contextUser && !id){
            this.createdBy = contextUser.name;
            this.createdAt = new Date();
            this.accountId  = contextUser.accountId ? new Types.ObjectId(contextUser.accountId) : undefined;
            this.createdById = new Types.ObjectId(contextUser.id);
            this.active = true;
            this.deleted = false;
            this._id = new Types.ObjectId();
        }
        
        if(id && contextUser){
            this.accountId = contextUser.accountId ? new Types.ObjectId(contextUser.accountId) : undefined;
            this._id = new Types.ObjectId(id);
            this.modifiedBy = contextUser.name;
            this.modifiedAt = new Date();
            this.modifiedById = new Types.ObjectId(contextUser.id);
            this.active = true;
            this.deleted = false;
        }

        this.privilegeIds = entityRequest.privilegeIds.map(prv => new Types.ObjectId(prv));

        return this;
    }

}