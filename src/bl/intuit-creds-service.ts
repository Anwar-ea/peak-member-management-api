import { inject, injectable } from "tsyringe";
import { IntuitCredsRepository } from "../dal";
import { IIntuitCredsRequest, IIntuitCredsResponse, IDataSourceResponse, IFetchRequest, IFilter } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { IntuitCreds } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { getTokenFromCallback, refreshToken, validateAccessToken } from "../utility";
import moment from "moment";

@injectable()
export class IntuitCredsService {
    constructor(@inject('IntuitCredsRepository') private readonly IntuitCredsRepository: IntuitCredsRepository) { }


    async addNew(entityRequest: IIntuitCredsRequest, contextUser: ITokenUser): Promise<IIntuitCredsResponse> {
        let intuitCreds = new IntuitCreds().toEntity(entityRequest, contextUser);
        return (await this.IntuitCredsRepository.add(intuitCreds)).toResponse();
    }

    async login(code: string,  realmId: string, contextUser: ITokenUser): Promise<IIntuitCredsResponse>{
        let {access_token, refresh_token, expires_in, x_refresh_token_expires_in} = await getTokenFromCallback(code);
        const creds = await this.IntuitCredsRepository.findOne({userId: contextUser.id});
        
        if(creds) return (await this.partialUpdate(contextUser.id, {
            accessToken: access_token, 
            refreshToken: refresh_token, 
            accessTokenExpiry: expires_in, 
            refreshTokenExpiry: x_refresh_token_expires_in,
            realmId,
            userId: contextUser.id
        }, contextUser));
        else return await this.addNew({
            accessToken: access_token, 
            refreshToken: refresh_token, 
            accessTokenExpiry: expires_in, 
            refreshTokenExpiry: x_refresh_token_expires_in,
            realmId,
            userId: contextUser.id
        }, contextUser)
        
    }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<IntuitCreds, keyof IntuitCreds>>): Promise<IIntuitCredsResponse | null> {
        let result = await this.IntuitCredsRepository.getOneByQuery(filtersRequest, true, true, contextUser.accountId);
        return result ? result.toResponse() : null;
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<IntuitCreds>): Promise<IDataSourceResponse<IIntuitCredsResponse>> {
        return await this.IntuitCredsRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IIntuitCredsResponse | null> {
        return await this.IntuitCredsRepository.findOneByIdWithResponse(id);
    }

    async update(userId: string, entityRequest: IIntuitCredsRequest, contextUser: ITokenUser): Promise<IIntuitCredsResponse> {
        let intuitCreds = new IntuitCreds().toEntity(entityRequest);
        intuitCreds.modifiedAt = new Date();
        intuitCreds.modifiedById = new Types.ObjectId(contextUser.id);
        intuitCreds.modifiedBy = contextUser.name;
        return await this.IntuitCredsRepository.findOneAndUpdate({ userId: userId }, intuitCreds);
    }

    async partialUpdate(userId: string, partialEntity: Partial<IIntuitCredsRequest>, contextUser: ITokenUser): Promise<IIntuitCredsResponse> {

        let entity: Partial<IntuitCreds> = {
            modifiedAt: new Date(),
            modifiedById: new Types.ObjectId(contextUser.id),
            modifiedBy: contextUser.name,
            status: partialEntity.accessToken && partialEntity.accessTokenExpiry ? 'active' : 'expired',
            accessTokenExpiry: partialEntity.accessTokenExpiry ? moment().add(partialEntity.accessTokenExpiry, 'seconds').toDate() : undefined,
            refreshTokenExpiry: partialEntity.refreshTokenExpiry ? moment().add(partialEntity.refreshTokenExpiry, 'seconds').toDate() : undefined
        };

        partialEntity.accessTokenExpiry = undefined
        partialEntity.refreshTokenExpiry = undefined
        return await this.IntuitCredsRepository.findOneAndUpdate({ userId }, assignIn(entity, partialEntity));
    }

    async expireSession(userId: string, contextUser: ITokenUser): Promise<void> {
        let entity: Partial<IntuitCreds> = {
            modifiedAt: new Date(),
            modifiedById: new Types.ObjectId(contextUser.id),
            modifiedBy: contextUser.name,
            status: 'expired',
            accessToken: undefined,
            refreshToken: undefined,
            accessTokenExpiry: undefined,
            refreshTokenExpiry: undefined
        };
        await this.IntuitCredsRepository.findOneAndUpdate({ userId }, entity);
    }

    async updateAccessToken(userId: string, contextUser: ITokenUser): Promise<IIntuitCredsResponse> {
        
        const creds = await this.IntuitCredsRepository.findOne({userId});
        let {access_token, refresh_token, expires_in, x_refresh_token_expires_in} = await refreshToken(creds?.refreshToken as string);
        
        if(creds && creds?.checkExpiaryStatus('refreshToken')){
            let entity: Partial<IIntuitCredsRequest> = {
                accessToken: access_token,
                refreshToken: refresh_token,
                accessTokenExpiry: expires_in,
                refreshTokenExpiry: x_refresh_token_expires_in,
                realmId: creds.realmId,
                userId
            };
            return await this.partialUpdate(contextUser.id, entity, contextUser)
        }
        else {
            await this.expireSession(contextUser.id, contextUser);
            throw new Error('Intuit Session Expired');
        }
    }
}