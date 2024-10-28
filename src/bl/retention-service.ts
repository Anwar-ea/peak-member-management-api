import { inject, injectable } from "tsyringe";
import { IDataSourceResponse, IFetchRequest, IFilter, ITokenUser, IRetentionResponse, IRetentionRequest } from "../models";
import { Retention } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { IRetentionService } from "./abstractions/retention-service";
import { IRetentionRepository } from "../dal/abstractions/retention-repository";

@injectable()
export class RetentionService implements IRetentionService {
    constructor(@inject('RetentionRepository') private readonly retentionRepository: IRetentionRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Retention, keyof Retention>>): Promise<IRetentionResponse | null> {
        return await this.retentionRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IRetentionRequest, contextUser?: ITokenUser): Promise<IRetentionResponse> {
        let retention = new Retention().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.retentionRepository.add(retention);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IRetentionRequest[], contextUser: ITokenUser): Promise<IRetentionResponse[]> {
        return (await this.retentionRepository.addRange(entitesRequest.map<Retention>(acc => {
            let retention = new Retention().toEntity(acc, undefined, contextUser);
            return retention;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Retention>): Promise<IDataSourceResponse<IRetentionResponse>> {
        return await this.retentionRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IRetentionResponse | null> {
        return await this.retentionRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IRetentionRequest, contextUser: ITokenUser): Promise<IRetentionResponse> {
        let retention = new Retention().toEntity(entityRequest, id, contextUser);
        return await this.retentionRepository.update(id, retention);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IRetentionRequest>, contextUser: ITokenUser): Promise<IRetentionResponse> {
        let entity: Partial<Retention> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.retentionRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IRetentionRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.retentionRepository.updateRange(entitesRequest.map<Retention>(acc => {
            let retention = new Retention().toEntity(acc, acc.id, contextUser);
            return retention;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.retentionRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let retentionS = await this.retentionRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(retentionS.length !== ids.length) throw new Error(`Some retention with provided ids not found`);

    }
}
