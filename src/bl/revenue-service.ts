import { inject, injectable } from "tsyringe";
import { IDataSourceResponse, IFetchRequest, IFilter, ITokenUser } from "../models";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { IRevenueService } from "./abstractions/revenue-service";
import { IRevenueRepository } from "../dal/abstractions/revenue-repository";
import { Revenue } from "../entities/revenue";
import { IRevenueRequest } from "../models/inerfaces/request/revenue-request";
import { IRevenueResponse } from "../models/inerfaces/response/revenue-response";

@injectable()
export class RevenueService implements IRevenueService {
    constructor(@inject('RevenueRepository') private readonly revenueRepository: IRevenueRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Revenue, keyof Revenue>>): Promise<IRevenueResponse | null> {
        return await this.revenueRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IRevenueRequest, contextUser?: ITokenUser): Promise<IRevenueResponse> {
        let revenue = new Revenue().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.revenueRepository.add(revenue);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IRevenueRequest[], contextUser: ITokenUser): Promise<IRevenueResponse[]> {
        return (await this.revenueRepository.addRange(entitesRequest.map<Revenue>(acc => {
            let revenue = new Revenue().toEntity(acc, undefined, contextUser);
            return revenue;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Revenue>): Promise<IDataSourceResponse<IRevenueResponse>> {
        return await this.revenueRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IRevenueResponse | null> {
        return await this.revenueRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IRevenueRequest, contextUser: ITokenUser): Promise<IRevenueResponse> {
        let revenue = new Revenue().toEntity(entityRequest, id, contextUser);
        return await this.revenueRepository.update(id, revenue);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IRevenueRequest>, contextUser: ITokenUser): Promise<IRevenueResponse> {
        let entity: Partial<Revenue> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.revenueRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IRevenueRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.revenueRepository.updateRange(entitesRequest.map<Revenue>(acc => {
            let revenue = new Revenue().toEntity(acc, acc.id, contextUser);
            return revenue;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.revenueRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let revenues = await this.revenueRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(revenues.length !== ids.length) throw new Error(`Some revenue with provided ids not found`);

    }
}
