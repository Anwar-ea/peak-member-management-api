import { Column, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { EntityBase } from "./entity-base";
import { Account } from "../account";
import { IAccountResponseBase, IResponseBase } from "../../models/inerfaces/response/response-base";
import { IAccountResponse } from "../../models";

export abstract class AccountEntityBase extends EntityBase {

    @RelationId((entity: AccountEntityBase) => entity.account)
    accountId!: string;

    
    @ManyToOne(() => Account, {nullable: false})
    @JoinColumn({name: 'AccountId', referencedColumnName: 'id'})
    account!: Account

    protected toAccountResponseBase<T extends AccountEntityBase>(entity: T): IAccountResponseBase {
        
        return {
            ...super.toResponseBase(entity),
            accountId: entity.accountId
        }
    }

} 