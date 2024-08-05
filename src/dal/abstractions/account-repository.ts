import { Account } from "../../entities";
import { IAccountResponse } from "../../models";
import { IRepositoryBase } from "./repository-base";

export interface IAccountRepository extends IRepositoryBase<Account, IAccountResponse> {
    
}