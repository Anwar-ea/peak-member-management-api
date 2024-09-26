import { Privilege } from "./privilege";
import { IRoleRequest, IRoleResponse, ResponseInput } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { EntityBase, entityBaseSchema } from "./base-entities/entity-base";
import { Account } from "./account";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Schema, Types } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../utility";

export class Role extends EntityBase implements IToResponseBase<Role, IRoleResponse> {
    name!: string;
    code!: string;
    privilegeIds!: Array<Types.ObjectId>;
    accountId?: Types.ObjectId;
    account?: Account | undefined
    privileges?: Array<Privilege>;
    
    toResponse(entity?: ResponseInput<Role>): IRoleResponse {
        if(!entity) entity = this;
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
            privilages: entity.privileges ? entity.privileges.map(prv => prv.toResponse(prv)) : undefined
        }    
    }

    toInstance(): Role {
        return documentToEntityMapper<Role>(new Role, this);
    };

    toEntity = (entityRequest: IRoleRequest, id?: string, contextUser?: ITokenUser): Role => {
        this.name = entityRequest.name;
        this.code = entityRequest.code;
        if(contextUser && !id){
            this.accountId = contextUser.accountId ? new Types.ObjectId(contextUser.accountId) : undefined;
            this.toBaseEntiy(contextUser);
        }
        
        if(id && contextUser){
            this.accountId = contextUser.accountId ? new Types.ObjectId(contextUser.accountId) : undefined;
            this.toBaseEntiy(contextUser, id)
        }

        this.privilegeIds = entityRequest.privilegeIds.map(prv => new Types.ObjectId(prv));

        return this;
    }

}

export const roleSchema = new Schema<Role>({
    name: { type: String, required: true },
    code: { type: String, required: true },
    privilegeIds: [{ type: Types.ObjectId, ref: 'Privilege' }],
    accountId: { type: Types.ObjectId, ref: 'Account' },
});

roleSchema.add(entityBaseSchema)

roleSchema.loadClass(Role);
roleSchema.virtual('privileges', {
    ref: 'Privilege',
    localField: 'privilegeIds',
    foreignField: '_id',
    justOne: false,
});
roleSchema.virtual('account', {
    ref: 'Account',
    localField: 'accountId',
    foreignField: '_id',
    justOne: true,
});

export const roleModel = modelCreator<Role, IRoleResponse>('Role', roleSchema);



