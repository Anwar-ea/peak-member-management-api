import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { EntityBase } from "./base-entities/entity-base";
import { Module } from "./module";
import { Role } from "./role";
import { IPrivilegeResponse } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";

@Entity('Privilage')
export class Privilege extends EntityBase implements IToResponseBase<Privilege, IPrivilegeResponse> {

    @Column({name: 'Name', type: 'nvarchar', unique: true})
    name!: string;

    @Column({name: 'Code', type: 'nvarchar', unique: true})
    code!: string;

    @RelationId((privilage: Privilege) => privilage.module)
    moduleId!: string;

    @ManyToOne(() => Module, (module) => module.privilages)
    @JoinColumn({name: 'ModuleId', referencedColumnName: 'id'})
    module!: Module;

    @ManyToMany(() => Role, (role) => role.privileges)
    @JoinTable({name: 'Role_Privilage', joinColumn: {name: 'PrivilegeId', referencedColumnName: 'id'}, inverseJoinColumn: {name: 'RoleId', referencedColumnName: 'id'}})
    roles!: Array<Role>;

    toResponse(entity: Privilege): IPrivilegeResponse {
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
            moduleId: entity.moduleId,
        }
    }
}