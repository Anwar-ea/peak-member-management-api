import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../dal";
import { IUserService } from "./abstractions";
import { FilterMatchModes, FilterOperators, IDataSourceResponse, IFetchRequest, IFilter, ILoginRequest, IUserRequest, IUserResponse, UserStatus } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { User } from "../entities";
import { randomUUID } from "crypto";
import { In } from "typeorm";
import { compareHash, encrypt, signJwt } from "../utility";
import { FastifyError } from 'fastify'

@injectable()
export class UserService implements IUserService {

    constructor(@inject('UserRepository') private readonly userRepository: IUserRepository) { }
    
    async login(loginRequest: ILoginRequest): Promise<IUserResponse & {token: string}> {
        let user = await this.userRepository.getOneByQuery([{field: 'userName', value: loginRequest.userName, operator: FilterOperators.Or, matchMode: FilterMatchModes.Equal}, {field: 'email', value: loginRequest.userName, operator: FilterOperators.Or, matchMode: FilterMatchModes.Equal, ignoreCase: true}]);
        let error: FastifyError = {code: '401', message: 'Invalid username or password', name: 'Unauthorized'};

        if (!user) throw new Error('Invalid username or password',  error);
        
        let match = await compareHash(loginRequest.password, user.passwordHash);

        if (match) {
            user.lastLogin = new Date();
            await this.userRepository.updateRecord(user);
            return {...user.toResponse(user), token: signJwt({id: user.id, name: `${user.firstName} ${user.lastName}`, accountId: user.accountId, privileges: []})};
        }
        else {
            throw new Error('Invalid username or password',  error);
        }
    }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<User, keyof User>>): Promise<IUserResponse | null> {
        return await this.userRepository.getOne(filtersRequest)
    }

    async add(entityRequest: IUserRequest, contextUser?: ITokenUser): Promise<IUserResponse> {
        let user = new User().toEntity(entityRequest, contextUser);
        user.passwordHash = await encrypt(entityRequest.password);
        user.status = UserStatus.Online;

        user.id = randomUUID();
        let response  = await this.userRepository.addRecord(user);
        if (response) return response;
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IUserRequest[], contextUser: ITokenUser): Promise<IUserResponse[]> {
        return this.userRepository.addMany(entitesRequest.map<User>(acc => {
            let user = new User().toEntity(acc, contextUser);
            user.id = randomUUID();
            return user;
        }))
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<User>): Promise<IDataSourceResponse<IUserResponse>> {
        return await this.userRepository.get(fetchRequest, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IUserResponse | null> {
        return await this.userRepository.getById(id);
    }

    async update(id: string, entityRequest: IUserRequest, contextUser: ITokenUser): Promise<IUserResponse> {
        let user = new User().toEntity(entityRequest);
        user.modifiedAt = new Date();
        user.modifiedById = contextUser.id;
        user.modifiedBy = contextUser.name;
        user.id = id;
        return await this.userRepository.updateRecord(user);
    }

    async updateMany(entitesRequest: (IUserRequest & { id: string; })[], contextUser: ITokenUser): Promise<IUserResponse[]> {
        return this.userRepository.updateMany(entitesRequest.map<User>(acc => {
            let user = new User().toEntity(acc, contextUser);
            user.modifiedAt = new Date();
            user.modifiedById = contextUser.id;
            user.modifiedBy = contextUser.name;
            user.id = acc.id;
            return user;
        }))
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        let user = await this.userRepository.findOneById(id);
        if(user) await this.userRepository.deleteEntity(user);
        else throw new Error(`User with id ${id} not found`);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let users = await this.userRepository.where({where:{id: In(ids)}});
        
        if(users.length !== ids.length) throw new Error(`Some user with provided ids not found`);

        await this.userRepository.deleteMany(users);
    }
}