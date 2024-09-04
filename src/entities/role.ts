import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Privilege } from "./privilege";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { IRoleRequest, IRoleResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { EntityBase } from "./base-entities/entity-base";
import { Account } from "./account";
import { randomUUID } from "crypto";
import { IToResponseBase } from "./abstractions/to-response-base";
import { User } from "./user";

@Entity('Role')
export class Role extends EntityBase implements IToResponseBase<Role, IRoleResponse> {
    @Column({name: 'Name', nullable: false, type: 'text'})
    name!: string;

    @Column({name: 'Code', nullable: false, type: 'text'})
    code!: string;

    @RelationId((entity: AccountEntityBase) => entity.account)
    accountId?: string;

    @ManyToOne(() => Account, {nullable: true, onDelete: 'CASCADE'})
    @JoinColumn({name: 'AccountId', referencedColumnName: 'id'})
    account!: Account | undefined
    
    @ManyToMany(() => Privilege, (privilege) => privilege.roles, {cascade: true, eager: true})
    @JoinTable({name: 'Role_Privilage', joinColumn: {name: 'RoleId', referencedColumnName: 'id'}, inverseJoinColumn: {name: 'PrivilegeId', referencedColumnName: 'id'}})
    privileges!: Array<Privilege>;

    @OneToMany(() => User, (user: User) => user.role)
    users!: Array<User>;
    
    toResponse(entity: Role): IRoleResponse {
        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
            privilages: entity.privileges.map(prv => prv.toResponse(prv))
        }    
    }

    toEntity = (entityRequest: IRoleRequest, id?: string, contextUser?: ITokenUser): Role => {
        this.name = entityRequest.name;
        this.code = entityRequest.code;
        if(contextUser && !id){
            this.createdBy = contextUser.name;
            this.createdAt = new Date();
            this.accountId  = contextUser.accountId;
            let account = new Account();
            account.id = contextUser.accountId;
            this.account = account;
            this.createdById = contextUser.id;
            this.active = true;
            this.deleted = false;
            this.id = randomUUID();
        }
        
        if(id && contextUser){
            this.accountId = contextUser.accountId;
            let account = new Account();
            account.id = contextUser.accountId;
            this.account = account;
            this.id = id;
            this.modifiedBy = contextUser.name;
            this.modifiedAt = new Date();
            this.modifiedById = contextUser.id;
            this.active = true;
            this.deleted = false;
        }

        this.privileges = entityRequest.privilegeIds.map(prv => {
            let privilege = new Privilege();
            privilege.id = prv;
            return privilege;
        });

        return this;
    }

}