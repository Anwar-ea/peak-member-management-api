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

    async getOne(contextBusinessPlan: ITokenUser, filtersRequest: Array<IFilter<BusinessPlan, keyof BusinessPlan>>): Promise<IBusinessPlanResponse | null> {
        return await this.businessPlanRepository.getOne(filtersRequest)
    }

    async add(entityRequest: IBusinessPlanRequest, contextBusinessPlan?: ITokenUser): Promise<IBusinessPlanResponse> {
        let businessPlan = new BusinessPlan().toEntity(entityRequest, undefined, contextBusinessPlan);
        let response  = await this.businessPlanRepository.addRecord(businessPlan);
        if (response) return response;
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IBusinessPlanRequest[], contextBusinessPlan: ITokenUser): Promise<IBusinessPlanResponse[]> {
        return this.businessPlanRepository.addMany(entitesRequest.map<BusinessPlan>(acc => {
            let businessPlan = new BusinessPlan().toEntity(acc, undefined, contextBusinessPlan);
            return businessPlan;
        }))
    }

    async get(contextBusinessPlan: ITokenUser, fetchRequest: IFetchRequest<BusinessPlan>): Promise<IDataSourceResponse<IBusinessPlanResponse>> {
        // fetchRequest.queryOptionsRequest = fetchRequest.queryOptionsRequest ? {...fetchRequest.queryOptionsRequest, includes:['User', 'MileStone']} :{includes:['User', 'MileStone']};
        return await this.businessPlanRepository.get(fetchRequest);
    }

    async getById(id: string, contextBusinessPlan: ITokenUser): Promise<IBusinessPlanResponse | null> {
        return await this.businessPlanRepository.getById(id);
    }

    async update(id: string, entityRequest: IBusinessPlanRequest, contextBusinessPlan: ITokenUser): Promise<IBusinessPlanResponse> {
        let businessPlan = new BusinessPlan().toEntity(entityRequest, id, contextBusinessPlan);
        return await this.businessPlanRepository.updateRecord(businessPlan);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IBusinessPlanRequest>, contextUser: ITokenUser): Promise<IBusinessPlanResponse> {
        let entity: Partial<BusinessPlan> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.businessPlanRepository.partialUpdate(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IBusinessPlanRequest & { id: string; })[], contextBusinessPlan: ITokenUser): Promise<IBusinessPlanResponse[]> {
        return this.businessPlanRepository.updateMany(entitesRequest.map<BusinessPlan>(acc => {
            let businessPlan = new BusinessPlan().toEntity(acc, acc.id, contextBusinessPlan);
            return businessPlan;
        }))
    }

    async delete(id: string, contextBusinessPlan: ITokenUser): Promise<void> {
        let businessPlan = await this.businessPlanRepository.findOneById(id);
        if(businessPlan) await this.businessPlanRepository.deleteEntity(businessPlan);
        else throw new Error(`BusinessPlan with id ${id} not found`);
    }

    async deleteMany(ids: string[], contextBusinessPlan: ITokenUser): Promise<void> {
        let businessPlans = await this.businessPlanRepository.where({where:{_id: In(ids)}});
        
        if(businessPlans.length !== ids.length) throw new Error(`Some businessPlan with provided ids not found`);

        await this.businessPlanRepository.deleteMany(businessPlans);
    }
}
