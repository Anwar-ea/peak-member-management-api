import { EntityBase, entityBaseSchema } from "./entity-base";
import { Account } from "../account";
import { IAccountResponseBase } from "../../models/inerfaces/response/response-base";
import { ITokenUser, ResponseInput } from "../../models";
import { Schema, Types } from "mongoose";

export abstract class AccountEntityBase extends EntityBase {
  accountId!: Types.ObjectId;
  account?: Account;

  protected toAccountEntity( contextUser: ITokenUser, id?: string): AccountEntityBase {
    this.accountId = new Types.ObjectId(contextUser.accountId.length ? contextUser.accountId : undefined);

    if (!id) {
      super.toBaseEntiy(contextUser);
    } else {
      super.toBaseEntiy(contextUser, id);
    }
    return this;
  }

  protected toAccountResponseBase<T extends AccountEntityBase>( entity: ResponseInput<T> ): IAccountResponseBase {
    return {
      ...super.toResponseBase(entity),
      accountId: entity.accountId.toString(), 
    };
  }
}


export const accountEntityBaseSchema = new Schema<AccountEntityBase>({
  accountId: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
});

accountEntityBaseSchema.add(entityBaseSchema);
accountEntityBaseSchema.loadClass(AccountEntityBase);
accountEntityBaseSchema.virtual('account', {
  ref: 'Account',
  localField: 'accountId',
  foreignField: '_id',
  justOne: true
});