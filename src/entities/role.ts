import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { Privilege } from "./privilege";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { IRoleRequest, IRoleResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { EntityBase } from "./base-entities/entity-base";
import { Account } from "./account";

@Entity('Role')
export class Role extends EntityBase {
    @Column({name: 'Name', nullable: false, type: 'nvarchar'})
    name!: string;

    @Column({name: 'Code', nullable: false, type: 'nvarchar'})
    code!: string;

    @RelationId((entity: AccountEntityBase) => entity.account)
    accountId?: string;

    @ManyToOne(() => Account, {nullable: true})
    @JoinColumn({name: 'AccountId', referencedColumnName: 'id'})
    account!: Account | undefined
    
    @ManyToMany(() => Privilege, (privilege) => privilege.roles)
    @JoinTable({name: 'Role_Privilage', joinColumn: {name: 'RoleId', referencedColumnName: 'id'}, inverseJoinColumn: {name: 'PrivilegeId', referencedColumnName: 'id'}})
    privileges!: Array<Privilege>;
    
    toResponse(entity: Role): IRoleResponse {
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
        }    
    }

    toEntity = (entityRequest: IRoleRequest, contextUser?: ITokenUser): Role => {
        this.name = entityRequest.name;
        this.code = entityRequest.code;
        if(contextUser){
            this.createdBy = contextUser.name;
            this.createdAt = new Date();
            this.createdById = contextUser.id;
            this.active = true;
            this.deleted = false;
        }
        return this;
    }

}