import { JoinColumn, ManyToOne, RelationId } from "typeorm";
import { EntityBase } from "./entity-base";
import { Account } from "../account";
import { IAccountResponseBase } from "../../models/inerfaces/response/response-base";
import { ITokenUser } from "../../models";

export abstract class AccountEntityBase extends EntityBase {
  @RelationId((entity: AccountEntityBase) => entity.account)
  accountId!: string;

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: "AccountId", referencedColumnName: "id" })
  account!: Account;

  protected toAccountEntity( contextUser: ITokenUser, update: boolean = false ): AccountEntityBase {
    this.accountId = contextUser.accountId;
    this.account = new Account();
    this.account.id = contextUser.accountId;
    if (!update) {
      super.toBaseEntiy(contextUser);
    } else {
      super.toBaseEntiy(contextUser, true);
    }
    return this;
  }

  protected toAccountResponseBase<T extends AccountEntityBase>( entity: T ): IAccountResponseBase {
    return {
      ...super.toResponseBase(entity),
      accountId: entity.accountId,
    };
  }
}
