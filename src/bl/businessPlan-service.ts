import { inject, injectable } from "tsyringe";
import { IBusinessPlanService } from "./abstractions";
import { IBusinessPlanRepository, IGoalRepository, IMeasurableRepository } from "../dal";
import { IDataSourceResponse, IFetchRequest, IFilter, IBusinessPlanRequest, IBusinessPlanResponse, ITokenUser, IGoalRequest, IMeasurableRequest } from "../models";
import { BusinessPlan, Goal, Measurable } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";

@injectable()
export class BusinessPlanService implements IBusinessPlanService {
    constructor (
        @inject('BusinessPlanRepository') private readonly businessPlanRepository: IBusinessPlanRepository, 
        @inject("MeasurableRepository") private readonly measurableRepository: IMeasurableRepository,
        @inject("GoalRepository") private readonly goalRepository: IGoalRepository
    ) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<BusinessPlan, keyof BusinessPlan>>): Promise<IBusinessPlanResponse | null> {
        return await this.businessPlanRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IBusinessPlanRequest, contextBusinessPlan?: ITokenUser): Promise<IBusinessPlanResponse> {
        let businessPlan = new BusinessPlan().toEntity(entityRequest, undefined, contextBusinessPlan);
        let response  = await this.businessPlanRepository.add(businessPlan);
        await this.goalRepository.addRange([...(businessPlan.threeYearVision.goals ?? []), ...(businessPlan.oneYearVision.goals ?? [])])
        await this.measurableRepository.addRange([...(businessPlan.threeYearVision.metrics ?? []), ...(businessPlan.oneYearVision.metrics ?? [])])
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

        if(partialEntity.oneYearVision){
            let goalsToUpdate = partialEntity.oneYearVision.goals.filter(x => x.id);
            let metricesToUpdate = partialEntity.oneYearVision.metrics.filter(x => x.id);
            await this.goalRepository.updateRange(goalsToUpdate.map<Partial<Goal>>((x: IGoalRequest) => {
                return {
                    title: x.title,
                    dueDate: x.dueDate,
                    modifiedAt: new Date(),
                    modifiedBy: contextUser.name,
                    modifiedById: new Types.ObjectId(contextUser.id)
                }
            }), {_id: {$in: goalsToUpdate.map(x => new Types.ObjectId(x.id))}});
            await this.measurableRepository.updateRange(metricesToUpdate.map<Partial<Measurable>>((x: IMeasurableRequest) => {
                return {
                    name: x.name,
                    modifiedAt: new Date(),
                    modifiedBy: contextUser.name,
                    modifiedById: new Types.ObjectId(contextUser.id)
                }
            }), {_id: {$in: metricesToUpdate.map(x => new Types.ObjectId(x.id))}});
        }

        if(partialEntity.threeYearVision){
            let goalsToUpdate = partialEntity.threeYearVision.goals.filter(x => x.id);
            let metricesToUpdate = partialEntity.threeYearVision.metrics.filter(x => x.id);
            await this.goalRepository.updateRange(goalsToUpdate.map<Partial<Goal>>((x: IGoalRequest) => {
                return {
                    title: x.title,
                    dueDate: x.dueDate,
                    modifiedAt: new Date(),
                    modifiedBy: contextUser.name,
                    modifiedById: new Types.ObjectId(contextUser.id)
                }
            }), {_id: {$in: goalsToUpdate.map(x => new Types.ObjectId(x.id))}});
            await this.measurableRepository.updateRange(metricesToUpdate.map<Partial<Measurable>>((x: IMeasurableRequest) => {
                return {
                    name: x.name,
                    modifiedAt: new Date(),
                    modifiedBy: contextUser.name,
                    modifiedById: new Types.ObjectId(contextUser.id)
                }
            }), {_id: {$in: metricesToUpdate.map(x => new Types.ObjectId(x.id))}});
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
