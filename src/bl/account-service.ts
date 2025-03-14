import { inject, injectable } from "tsyringe";
import { IAccountService } from "./abstractions";
import { IAccountRepository, IUserRepository } from "../dal";
import { IAccountRequest, IAccountResponse, IDataSourceResponse, IFetchRequest, IFilter, IUserRequest } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { Account, User } from "../entities";
import { randomUUID } from "crypto";
import { EmptyGuid } from "../constants/guid";
import { assignIn } from "lodash";
import { Types } from "mongoose";


@injectable()
export class AccountService implements IAccountService {
    constructor(@inject('AccountRepository') private readonly accountRepository: IAccountRepository, @inject('UserRepository') private readonly userRepository: IUserRepository){}
 

    async addNewAccount(entityRequest: IAccountRequest): Promise<IAccountResponse> {
        let account = new Account().toEntity(entityRequest);
        account.createdAt = new Date();
        account.active = true;
        account.deleted = false;
        account.createdById = new Types.ObjectId(EmptyGuid);
        account.createdBy = 'Admin';
        account._id = new Types.ObjectId();
        if(entityRequest.defaultUser){
            let userRequest: IUserRequest = {
                ...entityRequest.defaultUser,
                dateOfBirth: new Date(),
                roleId: '0CE02D11-A3E6-444B-BD89-B4C5A75ECD05',
                lawFirmId: "0CE02D11-A3E6-444B-BD89-B4C5A75ECD05"
            }
            let user = new User().toEntity(userRequest);
            user.createdAt = new Date();
            user.active = true;
            user.deleted = false;
            user.createdById = new Types.ObjectId(EmptyGuid);
            user.createdBy = 'Admin';
            user._id = new Types.ObjectId();

        }
        let response  = await this.accountRepository.add(account);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Account, keyof Account>>): Promise<IAccountResponse | null> {
        let result = await this.accountRepository.getOneByQuery(filtersRequest, true, true, contextUser.accountId);
        return result ? result.toResponse() : null;
    }

    async add(entityRequest: IAccountRequest, contextUser?: ITokenUser): Promise<IAccountResponse> {
        let account = new Account().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.accountRepository.add(account);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IAccountRequest[], contextUser: ITokenUser): Promise<IAccountResponse[]> {
        return (await this.accountRepository.addRange(entitesRequest.map<Account>(acc => {
            let account = new Account().toEntity(acc, undefined, contextUser);
            return account;
        }))).map(x => x.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Account>): Promise<IDataSourceResponse<IAccountResponse>> {
        return await this.accountRepository.getPagedData(fetchRequest, true, true);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IAccountResponse | null> {
        return await this.accountRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IAccountRequest, contextUser: ITokenUser): Promise<IAccountResponse> {
        let account = new Account().toEntity(entityRequest);
        account.modifiedAt = new Date();
        account.modifiedById = new Types.ObjectId(contextUser.id);
        account.modifiedBy = contextUser.name;
        account._id = new Types.ObjectId(id);
        return await this.accountRepository.update(id, account);
    }

    async partialUpdate(id: string, partialEntity: Partial<Omit<IAccountRequest, 'defaultUser'>>, contextUser: ITokenUser): Promise<IAccountResponse> {

        let entity: Partial<Account> = {
            modifiedAt: new Date(),
            modifiedById: new Types.ObjectId(contextUser.id),
            modifiedBy: contextUser.name
        };
        
        return await this.accountRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IAccountRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return (await this.accountRepository.updateRange(entitesRequest.map<Account>(acc => {
            let account = new Account().toEntity(acc, acc.id, contextUser);
            return account;
        }),{}))
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.accountRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let accounts = await this.accountRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(accounts.length !== ids.length) throw new Error(`Some account with provided ids not found`);
    }
}