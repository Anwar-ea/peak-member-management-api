import { Column, PrimaryColumn } from "typeorm";
import { IResponseBase } from "../../models/inerfaces/response/response-base";

export abstract class EntityBase {
    @PrimaryColumn({name: 'Id',type: 'uuid'})
    id!: string;

    @Column({name: 'CreatedAt', type: 'datetime'})
    createdAt!: Date;

    @Column({name: 'Active', type: 'bit', default: 1})
    active!: boolean;

    @Column({name: 'CreatedBy', type: 'nvarchar'})
    createdBy!: string;

    @Column({name: 'CreatedById', type: 'uuid'})
    createdById!: string;

    @Column({name: 'ModifiedAt', type: 'datetime', default: null, nullable: true})
    modifiedAt?: Date;

    @Column({name: 'ModifiedBy', type: 'nvarchar', default: null, nullable: true})
    modifiedBy?: string;

    @Column({name: 'ModifiedById', type: 'uuid', default: null, nullable: true})
    modifiedById?: string;

    @Column({name: 'Deleted', type: 'bit', default: 0})
    deleted!: boolean; 
    
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