import { inject, injectable } from "tsyringe";
import { IAccountService } from "./abstractions";
import { IAccountRepository, IUserRepository } from "../dal";
import { IAccountRequest, IAccountResponse, IDataSourceResponse, IFetchRequest, IFilter, IUserRequest } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { Account, User } from "../entities";
import { randomUUID } from "crypto";
import { EmptyGuid } from "../constants/guid";
import { In } from "typeorm";

@injectable()
export class AccountService implements IAccountService {
    constructor(@inject('AccountRepository') private readonly accountRepository: IAccountRepository, @inject('UserRepository') private readonly userRepository: IUserRepository){}

    async addNewAccount(entityRequest: IAccountRequest): Promise<IAccountResponse> {
        let account = new Account().toEntity(entityRequest);
        account.createdAt = new Date();
        account.active = true;
        account.deleted = false;
        account.createdById = EmptyGuid;
        account.createdBy = 'Admin';
        account.id = randomUUID();
        if(entityRequest.defaultUser){
            let userRequest: IUserRequest = {
                ...entityRequest.defaultUser,
                dateOfBirth: new Date(),
                roleId: '0CE02D11-A3E6-444B-BD89-B4C5A75ECD05',
            }
            let user = new User().toEntity(userRequest);
            user.createdAt = new Date();
            user.active = true;
            user.deleted = false;
            user.createdById = EmptyGuid;
            user.createdBy = 'Admin';
            user.id = randomUUID();

        }
        let response  = await this.accountRepository.addRecord(account);
        if (response) return response;
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Account, keyof Account>>): Promise<IAccountResponse | null> {
        return await this.accountRepository.getOne(filtersRequest)
    }

    async add(entityRequest: IAccountRequest, contextUser?: ITokenUser): Promise<IAccountResponse> {
        let account = new Account().toEntity(entityRequest, undefined, contextUser);
        account.id = randomUUID();
        let response  = await this.accountRepository.addRecord(account);
        if (response) return response;
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IAccountRequest[], contextUser: ITokenUser): Promise<IAccountResponse[]> {
        return this.accountRepository.addMany(entitesRequest.map<Account>(acc => {
            let account = new Account().toEntity(acc, undefined, contextUser);
            account.id = randomUUID();
            return account;
        }))
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Account>): Promise<IDataSourceResponse<IAccountResponse>> {
        return await this.accountRepository.get(fetchRequest);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IAccountResponse | null> {
        return await this.accountRepository.getById(id);
    }

    async update(id: string, entityRequest: IAccountRequest, contextUser: ITokenUser): Promise<IAccountResponse> {
        let account = new Account().toEntity(entityRequest);
        account.modifiedAt = new Date();
        account.modifiedById = contextUser.id;
        account.modifiedBy = contextUser.name;
        account.id = id;
        return await this.accountRepository.updateRecord(account);
    }

    async updateMany(entitesRequest: (IAccountRequest & { id: string; })[], contextUser: ITokenUser): Promise<IAccountResponse[]> {
        return this.accountRepository.updateMany(entitesRequest.map<Account>(acc => {
            let account = new Account().toEntity(acc, acc.id, contextUser);
            account.modifiedAt = new Date();
            account.modifiedById = contextUser.id;
            account.modifiedBy = contextUser.name;
            account.id = acc.id;
            return account;
        }))
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        let account = await this.accountRepository.findOneById(id);
        if(account) await this.accountRepository.deleteEntity(account);
        else throw new Error(`Account with id ${id} not found`);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let accounts = await this.accountRepository.where({where:{id: In(ids)}});
        
        if(accounts.length !== ids.length) throw new Error(`Some account with provided ids not found`);

        await this.accountRepository.deleteMany(accounts);
    }
}