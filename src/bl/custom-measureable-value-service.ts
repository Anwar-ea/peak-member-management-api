import { inject, injectable } from "tsyringe";
import { IDataSourceResponse, IFetchRequest, IFilter, ITokenUser } from "../models";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { ICustomMeasureableValueService } from "./abstractions/custom-measureable-value-service";
import { ICustomMeasureableValueRepository } from "../dal";
import { CustomMeasureableValue } from "../entities";
import { ICustomMeasureableValueRequest, ICustomMeasureableValueResponse } from "../models";

@injectable()
export class CustomMeasureableValueService implements ICustomMeasureableValueService {
    constructor(@inject('CustomMeasureableValueRepository') private readonly revenueRepository: ICustomMeasureableValueRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<CustomMeasureableValue, keyof CustomMeasureableValue>>): Promise<ICustomMeasureableValueResponse | null> {
        return await this.revenueRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: ICustomMeasureableValueRequest, contextUser?: ITokenUser): Promise<ICustomMeasureableValueResponse> {
        let revenue = new CustomMeasureableValue().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.revenueRepository.add(revenue);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: ICustomMeasureableValueRequest[], contextUser: ITokenUser): Promise<ICustomMeasureableValueResponse[]> {
        return (await this.revenueRepository.addRange(entitesRequest.map<CustomMeasureableValue>(acc => {
            let revenue = new CustomMeasureableValue().toEntity(acc, undefined, contextUser);
            return revenue;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<CustomMeasureableValue>): Promise<IDataSourceResponse<ICustomMeasureableValueResponse>> {
        return await this.revenueRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<ICustomMeasureableValueResponse | null> {
        return await this.revenueRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: ICustomMeasureableValueRequest, contextUser: ITokenUser): Promise<ICustomMeasureableValueResponse> {
        let revenue = new CustomMeasureableValue().toEntity(entityRequest, id, contextUser);
        return await this.revenueRepository.update(id, revenue);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<ICustomMeasureableValueRequest>, contextUser: ITokenUser): Promise<ICustomMeasureableValueResponse> {
        let entity: Partial<CustomMeasureableValue> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.revenueRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (ICustomMeasureableValueRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.revenueRepository.updateRange(entitesRequest.map<CustomMeasureableValue>(acc => {
            let revenue = new CustomMeasureableValue().toEntity(acc, acc.id, contextUser);
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
