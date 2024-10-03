import { EntityBase, entityBaseSchema } from "./base-entities/entity-base";
import { IPrivilegeResponse, ResponseInput } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { EmptyGuid } from "../constants";
import { Schema, Types } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../utility";

export class Privilege extends EntityBase implements IToResponseBase<Privilege, IPrivilegeResponse> {

    name!: string;
    code!: string;
    newInstanceToAdd(name: string, code: string): Privilege {
        this._id = new Types.ObjectId();
        this.createdAt = new Date();
        this.createdBy = "Super Admin";
        this.createdById = new Types.ObjectId();
        this.active = true;
        this.deleted = false;
        this.name = name;
        this.code = code;
        return this;
    }

    toInstance(): Privilege {
        return documentToEntityMapper<Privilege>(new Privilege, this);
    };

    toResponse(entity?: ResponseInput<Privilege>): IPrivilegeResponse {
        if(!entity) entity = this;
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
        }
    }
}

export const privilegeSchema = new Schema<Privilege>({
    name: { type: String, required: true },
    code: { type: String, required: true },
});
privilegeSchema.add(entityBaseSchema)

privilegeSchema.loadClass(Privilege);

export const PrivilegeModel = modelCreator<Privilege, IPrivilegeResponse>('Privilege', privilegeSchema);