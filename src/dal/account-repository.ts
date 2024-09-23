import { injectable } from "tsyringe";
import { IAccountRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { Account, accountModel } from "../entities";
import { IAccountResponse } from "../models";

@injectable()
export class AccountRepository extends GenericRepository<Account, IAccountResponse> implements IAccountRepository {
    constructor(){
        super(accountModel);
    }

}