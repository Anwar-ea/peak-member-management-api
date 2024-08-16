import { Column, Entity, OneToMany } from "typeorm";
import { EntityBase } from "./base-entities/entity-base";
import { Privilege } from "./privilege";
import { IModuleResponse } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { randomUUID } from "crypto";
import { EmptyGuid } from "../constants";

@Entity('Module')
export class Module extends EntityBase implements IToResponseBase<Module, IModuleResponse>  {
    
    @Column({name: 'Name', type: 'nvarchar', unique: true})
    name!: string;

    @Column({name: 'Code', type: 'nvarchar', unique: true})
    code!: string;

    @OneToMany(() => Privilege, (privilege) => privilege.module, {eager: true, onDelete: "CASCADE"})
    privilages?: Array<Privilege>;

    newInstanceToAdd(name: string, code: string, privilages: Array<Privilege>): Module {
        this.id = randomUUID();
        this.createdAt = new Date();
        this.createdBy = "Super Admin";
        this.createdById = EmptyGuid;
        this.active = true;
        this.deleted = false;
        this.name = name;
        this.code = code;
        this.privilages = privilages;
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