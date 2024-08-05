import { Account } from "../../entities";
import { IAccountRequest, IAccountResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface IAccountService extends IServiceBase<IAccountRequest, IAccountResponse, Account> {
    addNewAccount(entityRequest: IAccountRequest): Promise<IAccountResponse>
}