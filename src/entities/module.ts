import { EntityBase, entityBaseSchema } from "./base-entities/entity-base";
import { Privilege } from "./privilege";
import { IModuleResponse, ResponseInput } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { EmptyGuid } from "../constants";
import { Schema, Types } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../utility";

export class Module extends EntityBase implements IToResponseBase<Module, IModuleResponse>  {
    name!: string;
    code!: string;
    privilageIds!: Array<Types.ObjectId>;
    privilages?: Array<Privilege>;

    newInstanceToAdd(name: string, code: string, privilages: Array<Privilege>): Module {
        this._id = new Types.ObjectId();
        this.createdAt = new Date();
        this.createdBy = "Super Admin";
        this.createdById = new Types.ObjectId(undefined);
        this.active = true;
        this.deleted = false;
        this.name = name;
        this.code = code;
        this.privilageIds = privilages.map(x => x._id);
        return this;
    }

    toInstance(): Module {
        return documentToEntityMapper<Module>(new Module, this);
    };

    toResponse(entity?: ResponseInput<Module>): IModuleResponse {
        if(!entity) entity = this;
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
            privilages: entity.privilages?.map((privilege) => privilege.toResponse(privilege)),
        }
    }
}

export const moduleSchema =  new Schema<Module>({
    name: { type: String, required: true },
    code: { type: String, required: true },
    privilageIds: [{ type: Types.ObjectId, ref: 'Privilege' }],
});

moduleSchema.loadClass(Module);
moduleSchema.add(entityBaseSchema);

moduleSchema.virtual('privilages', {
    ref: 'Privilege',
    localField: 'privilageIds',
    foreignField: '_id',
    justOne: false,
});

export const moduleModel = modelCreator<Module, IModuleResponse>('Module', moduleSchema);
