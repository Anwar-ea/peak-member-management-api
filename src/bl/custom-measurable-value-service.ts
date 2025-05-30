import { inject, injectable } from "tsyringe";
import { IDataSourceResponse, IFetchRequest, IFilter, ITokenUser } from "../models";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { ICustomMeasurableValueService } from "./abstractions/custom-measurable-value-service";
import { ICustomMeasurableValueRepository } from "../dal";
import { CustomMeasurableValue } from "../entities";
import { ICustomMeasurableValueRequest, ICustomMeasurableValueResponse } from "../models";

@injectable()
export class CustomMeasurableValueService implements ICustomMeasurableValueService {
    constructor(@inject('CustomMeasurableValueRepository') private readonly revenueRepository: ICustomMeasurableValueRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<CustomMeasurableValue, keyof CustomMeasurableValue>>): Promise<ICustomMeasurableValueResponse | null> {
        return await this.revenueRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: ICustomMeasurableValueRequest, contextUser?: ITokenUser): Promise<ICustomMeasurableValueResponse> {
        let revenue = new CustomMeasurableValue().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.revenueRepository.add(revenue);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: ICustomMeasurableValueRequest[], contextUser: ITokenUser): Promise<ICustomMeasurableValueResponse[]> {
        return (await this.revenueRepository.addRange(entitesRequest.map<CustomMeasurableValue>(acc => {
            let revenue = new CustomMeasurableValue().toEntity(acc, undefined, contextUser);
            return revenue;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<CustomMeasurableValue>): Promise<IDataSourceResponse<ICustomMeasurableValueResponse>> {
        return await this.revenueRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<ICustomMeasurableValueResponse | null> {
        return await this.revenueRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: ICustomMeasurableValueRequest, contextUser: ITokenUser): Promise<ICustomMeasurableValueResponse> {
        let revenue = new CustomMeasurableValue().toEntity(entityRequest, id, contextUser);
        return await this.revenueRepository.update(id, revenue);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<ICustomMeasurableValueRequest>, contextUser: ITokenUser): Promise<ICustomMeasurableValueResponse> {
        let entity: Partial<CustomMeasurableValue> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.revenueRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (ICustomMeasurableValueRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.revenueRepository.updateRange(entitesRequest.map<CustomMeasurableValue>(acc => {
            let revenue = new CustomMeasurableValue().toEntity(acc, acc.id, contextUser);
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
