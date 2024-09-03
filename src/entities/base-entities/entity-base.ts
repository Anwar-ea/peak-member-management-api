import { Column, PrimaryColumn } from "typeorm";
import { IResponseBase } from "../../models/inerfaces/response/response-base";
import { ITokenUser } from "../../models";
import { EmptyGuid } from "../../constants";
import { randomUUID } from "crypto";

export abstract class EntityBase {
    @PrimaryColumn({name: 'Id',type: 'uuid'})
    id!: string;

    @Column({name: 'CreatedAt', type: 'timestamp'})
    createdAt!: Date;

    @Column({name: 'Active', type: 'boolean', default: 1})
    active!: boolean;

    @Column({name: 'CreatedBy', type: 'text'})
    createdBy!: string;

    @Column({name: 'CreatedById', type: 'uuid'})
    createdById!: string;

    @Column({name: 'ModifiedAt', type: 'timestamp', default: null, nullable: true})
    modifiedAt?: Date;

    @Column({name: 'ModifiedBy', type: 'text', default: null, nullable: true})
    modifiedBy?: string;

    @Column({name: 'ModifiedById', type: 'uuid', default: null, nullable: true})
    modifiedById?: string;

    @Column({name: 'Deleted', type: 'boolean', default: 0})
    deleted!: boolean; 

    protected toBaseEntiy(contextUser: ITokenUser, update: boolean = false): EntityBase {
            this.active = true;
            this.deleted = false;
        if(!update){
            this.id = randomUUID();
            this.createdAt = new Date();
            this.createdBy = contextUser.name;
            this.createdById = contextUser.id;
        }else {
            this.modifiedAt = new Date();
            this.modifiedBy = contextUser.name;
            this.modifiedById = contextUser.id;
        }

        return this;
    }
    
    protected toResponseBase<T extends EntityBase>(entity: T): IResponseBase {
        return {
            id: entity.id,
            active: entity.active,
            createdAt: entity.createdAt,
            createdBy: entity.createdBy,
            createdById: entity.createdById,
            modifiedAt: entity.modifiedAt,
            modifiedBy: entity.modifiedBy,
            modifiedById: entity.modifiedById,
        }
    }
}