import { Column, Entity, OneToMany } from "typeorm";
import { EntityBase } from "./base-entities/entity-base";
import { Privilege } from "./privilege";
import { IModuleResponse } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";

@Entity('Module')
export class Module extends EntityBase implements IToResponseBase<Module, IModuleResponse>  {
    
    @Column({name: 'Name', type: 'nvarchar', unique: true})
    name!: string;

    @Column({name: 'Code', type: 'nvarchar', unique: true})
    code!: string;

    @OneToMany(() => Privilege, (privilege) => privilege.module)
    privilages?: Array<Privilege>;

    toResponse(entity: Module): IModuleResponse {
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
        }
    }
}