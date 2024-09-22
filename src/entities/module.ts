import { Column, Entity, Index, OneToMany } from "typeorm";
import { EntityBase } from "./base-entities/entity-base";
import { Privilege } from "./privilege";
import { IModuleResponse } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { randomUUID } from "crypto";
import { EmptyGuid } from "../constants";
import { Types } from "mongoose";

export class Module extends EntityBase implements IToResponseBase<Module, IModuleResponse>  {
    name!: string;
    code!: string;
    privilageIds!: Array<Types.ObjectId>;
    privilages?: Array<Privilege>;

    newInstanceToAdd(name: string, code: string, privilages: Array<Privilege>): Module {
        this._id = new Types.ObjectId();
        this.createdAt = new Date();
        this.createdBy = "Super Admin";
        this.createdById = new Types.ObjectId(EmptyGuid);
        this.active = true;
        this.deleted = false;
        this.name = name;
        this.code = code;
        this.privilageIds = privilages.map(x => x._id);
        return this;
    }

    toResponse(entity: Module): IModuleResponse {
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
            privilages: entity.privilages?.map((privilege) => privilege.toResponse(privilege)),
        }
    }
}