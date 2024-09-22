import { EntityBase } from "./base-entities/entity-base";
import { Role } from "./role";
import { IPrivilegeResponse } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { randomUUID } from "crypto";
import { EmptyGuid } from "../constants";
import { Types } from "mongoose";

export class Privilege extends EntityBase implements IToResponseBase<Privilege, IPrivilegeResponse> {

    name!: string;
    code!: string;
    newInstanceToAdd(name: string, code: string): Privilege {
        this._id = new Types.ObjectId();
        this.createdAt = new Date();
        this.createdBy = "Super Admin";
        this.createdById = new Types.ObjectId(EmptyGuid);
        this.active = true;
        this.deleted = false;
        this.name = name;
        this.code = code;
        return this;
    }

    toResponse(entity: Privilege): IPrivilegeResponse {
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
        }
    }
}