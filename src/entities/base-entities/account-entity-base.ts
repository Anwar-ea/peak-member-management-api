import { EntityBase } from "./entity-base";
import { Account } from "../account";
import { IAccountResponseBase } from "../../models/inerfaces/response/response-base";
import { ITokenUser } from "../../models";
import { Types } from "mongoose";

export abstract class AccountEntityBase extends EntityBase {
  accountId!: Types.ObjectId;
  account?: Account;

  protected toAccountEntity( contextUser: ITokenUser, id?: string): AccountEntityBase {
    this.accountId = new Types.ObjectId(contextUser.accountId);

    if (!id) {
      super.toBaseEntiy(contextUser);
    } else {
      super.toBaseEntiy(contextUser, id);
    }
    return this;
  }

  protected toAccountResponseBase<T extends AccountEntityBase>( entity: T ): IAccountResponseBase {
    return {
      ...super.toResponseBase(entity),
      accountId: entity.accountId.toString(),
    };
  }
}
