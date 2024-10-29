import { inject, injectable } from "tsyringe";
import { IMeasurableRepository, IPrivilegeRepository, IUserRepository } from "../dal";
import { IUserService } from "./abstractions";
import { IDataSourceResponse, IFetchRequest, IFilter, ILoginRequest, IUserRequest, IUserResponse, UserStatus } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { Measurable, User } from "../entities";
import { compareHash, encrypt, signJwt } from "../utility";
import { FastifyError } from 'fastify'
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { IDropdownResponse } from "../models/inerfaces/response/dropdown-response";
import { IResetPassword } from "../models/inerfaces/request/resetPasswordRequest";
import { Goals, GoalUnits } from "../models/enums/goals.enum";

@injectable()
export class UserService implements IUserService {

    constructor(
        @inject('UserRepository') private readonly userRepository: IUserRepository, 
        @inject('PrivilegeRepository') private readonly privilegeRepository: IPrivilegeRepository,
        @inject('MeasurableRepository') private readonly measureableRepoisitory: IMeasurableRepository,
    
    ) { }
    
    async login(loginRequest: ILoginRequest): Promise<IUserResponse & {token: string}> {
        let user = await this.userRepository.findOne({$or:[{userName: loginRequest.userName},{email: loginRequest.userName}], active: true});
        let error: FastifyError = {code: '401', message: 'Invalid username or password', name: 'Unauthorized'};

        if (!user) throw new Error('Invalid username or password',  error);
        
        let match = await compareHash(loginRequest.password, user.passwordHash);

        if (match) {
            user.lastLogin = new Date();
            await this.userRepository.update(user._id.toString(),user);
            let privilages = await this.privilegeRepository.find({_id: {$in: user.role?.privilegeIds ?? []}});
            if(user.role ) user.role.privileges = privilages;
            return {...user.toResponse(user), token: signJwt({id: user._id.toString(), name: `${user.firstName} ${user.lastName}`, accountId: user.accountId.toString(), privileges: []})};
        }
        else {
            throw new Error('Invalid username or password',  error);
        }
    }
    
    async loginAsMember(memberId: string): Promise<IUserResponse & {token: string}> {
        let user = await this.userRepository.findOneById(memberId) as User;

            user.lastLogin = new Date();
            await this.userRepository.update(user._id.toString(),user);
            let privilages = await this.privilegeRepository.find({_id: {$in: user.role?.privilegeIds ?? []}});
            if(user.role ) user.role.privileges = privilages;
            return {...user.toResponse(user), token: signJwt({id: user._id.toString(), name: `${user.firstName} ${user.lastName}`, accountId: user.accountId.toString(), privileges: []})};

    }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<User, keyof User>>): Promise<IUserResponse | null> {
        return await this.userRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IUserRequest, contextUser?: ITokenUser): Promise<IUserResponse> {
        let user = new User().toEntity(entityRequest, undefined, contextUser);

        let revenueMeasurable = new Measurable().toEntity({
            name: 'Revenue',
            unit: GoalUnits.RetentionRate,
            goal: Goals.GreaterThanOrEqualTo,
            goalMetric: 10000,
            showAverage: true,
            showCumulative: true,
            applyFormula: false,
            formula: '',
            accountableId: user._id.toString()
        }, 
        undefined, 
        {id: user._id.toString(), name: `${user.firstName} ${user.lastName}`, accountId: user.accountId.toString(), privileges: []});

        let retentionMeasurable = new Measurable().toEntity({
            name: 'Revenue',
            unit: GoalUnits.RetentionRate,
            goal: Goals.GreaterThanOrEqualTo,
            goalMetric: 10000,
            showAverage: true,
            showCumulative: true,
            applyFormula: false,
            formula: '',
            accountableId: user._id.toString()
        }, 
        undefined, 
        {id: user._id.toString(), name: `${user.firstName} ${user.lastName}`, accountId: user.accountId.toString(), privileges: []})

        await this.measureableRepoisitory.addRange([revenueMeasurable, retentionMeasurable])
        user.passwordHash = await encrypt(entityRequest.password);
        user.status = UserStatus.Online;
        let response  = await this.userRepository.add(user);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IUserRequest[], contextUser: ITokenUser): Promise<IUserResponse[]> {
        return (await this.userRepository.addRange(entitesRequest.map<User>(acc => {
            let user = new User().toEntity(acc, undefined, contextUser);
            return user;
        }))).map(u => u.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<User>): Promise<IDataSourceResponse<IUserResponse>> {
        return await this.userRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IUserResponse | null> {
        return await this.userRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IUserRequest, contextUser: ITokenUser): Promise<IUserResponse> {
        let user = new User().toEntity(entityRequest, id, contextUser);
        return await this.userRepository.update(id, user);
    }

    async partialUpdate(id: string, entityRequest: Partial<IUserRequest>, contextUser: ITokenUser): Promise<IUserResponse> {
        let entity: Partial<User> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id),
        };

        return await this.userRepository.update(id, assignIn(entity, entityRequest));
    }

    async resetPassword(resetPassword: IResetPassword, contextUser: ITokenUser): Promise<IUserResponse> {
        let entity: Partial<User> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id),
            passwordHash: await encrypt(resetPassword.password)
        };
        let updatedEntity = this.userRepository.update(resetPassword.userId, entity);
        return updatedEntity;
    }

    async updateMany(entitesRequest: (IUserRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return this.userRepository.updateRange(entitesRequest.map<User>(acc => {
            let user = new User().toEntity(acc, acc.id, contextUser);
            return user;
        }), {})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.userRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let users = await this.userRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(users.length !== ids.length) throw new Error(`Some user with provided ids not found`);

    }

    async dropdown(accountId: string): Promise<IDropdownResponse[]> {
        return await this.userRepository.dropdown(accountId, ['firstName', 'lastName']);
    }
}