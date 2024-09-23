import { inject, injectable } from "tsyringe";
import { IBusinessPlanService } from "./abstractions";
import { IBusinessPlanRepository } from "../dal";
import { IDataSourceResponse, IFetchRequest, IFilter, IBusinessPlanRequest, IBusinessPlanResponse, ITokenUser } from "../models";
import { randomUUID } from "crypto";
import { In } from "typeorm";
import { BusinessPlan } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";

@injectable()
export class BusinessPlanService implements IBusinessPlanService {
    constructor(@inject('BusinessPlanRepository') private readonly businessPlanRepository: IBusinessPlanRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<BusinessPlan, keyof BusinessPlan>>): Promise<IBusinessPlanResponse | null> {
        return await this.businessPlanRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IBusinessPlanRequest, contextBusinessPlan?: ITokenUser): Promise<IBusinessPlanResponse> {
        let businessPlan = new BusinessPlan().toEntity(entityRequest, undefined, contextBusinessPlan);
        let response  = await this.businessPlanRepository.add(businessPlan);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IBusinessPlanRequest[], contextUser: ITokenUser): Promise<IBusinessPlanResponse[]> {
        return (await this.businessPlanRepository.addRange(entitesRequest.map<BusinessPlan>(acc => {
            let businessPlan = new BusinessPlan().toEntity(acc, undefined, contextUser);
            return businessPlan;
        }))).map(b => b.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<BusinessPlan>): Promise<IDataSourceResponse<IBusinessPlanResponse>> {
        return await this.businessPlanRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IBusinessPlanResponse | null> {
        return await this.businessPlanRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IBusinessPlanRequest, contextUser: ITokenUser): Promise<IBusinessPlanResponse> {
        let businessPlan = new BusinessPlan().toEntity(entityRequest, id, contextUser);
        return await this.businessPlanRepository.update(id, businessPlan);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IBusinessPlanRequest>, contextUser: ITokenUser): Promise<IBusinessPlanResponse> {
        let entity: Partial<BusinessPlan> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.businessPlanRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IBusinessPlanRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.businessPlanRepository.updateRange(entitesRequest.map<BusinessPlan>(acc => {
            let businessPlan = new BusinessPlan().toEntity(acc, acc.id, contextUser);
            return businessPlan;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.businessPlanRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let businessPlans = await this.businessPlanRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(businessPlans.length !== ids.length) throw new Error(`Some businessPlan with provided ids not found`);

    }
}
