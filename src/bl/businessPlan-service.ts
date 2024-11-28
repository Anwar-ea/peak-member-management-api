import { inject, injectable } from "tsyringe";
import { IBusinessPlanService } from "./abstractions";
import { IBusinessPlanRepository, IGoalRepository, IMeasurableRepository } from "../dal";
import { IDataSourceResponse, IFetchRequest, IFilter, IBusinessPlanRequest, IBusinessPlanResponse, ITokenUser, IGoalRequest, IMeasurableRequest, IVisionRequest } from "../models";
import { BusinessPlan, Goal, IVision, Measurable } from "../entities";
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
            entity.oneYearVision = await this.updateVision(partialEntity.oneYearVision, contextUser);
        }

        if(partialEntity.threeYearVision){
            entity.threeYearVision = await this.updateVision(partialEntity.threeYearVision, contextUser);
        }
        return await this.businessPlanRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateVision(visionReq: IVisionRequest, contextUser: ITokenUser): Promise<IVision> {


        let goalsToUpdate = visionReq.goals.filter(x => x.id);
        let metricesToUpdate = visionReq.metrics.filter(x => x.id);
        await Promise.all(goalsToUpdate.map(goal => {
            this.goalRepository.update(goal.id as string, {
                title: goal.title,
                dueDate: goal.dueDate,
                modifiedAt: new Date(),
                modifiedBy: contextUser.name,
                modifiedById: new Types.ObjectId(contextUser.id)
            })
        }));

        await Promise.all(metricesToUpdate.map(metric => {
            this.measurableRepository.update(metric.id as string, {
                name: metric.name,
                modifiedAt: new Date(),
                modifiedBy: contextUser.name,
                modifiedById: new Types.ObjectId(contextUser.id)
            })
        }));

        let newGoals = visionReq.goals.filter(goal => !goal.id);
        let newMetrics = visionReq.metrics.filter(metric => !metric.id);
        let vision: IVision = {
            futureDate: visionReq.futureDate,
            revenue: visionReq.revenue,
            profit: visionReq.profit,
            goalIds: visionReq.goals.filter(x => x.id ? false : true).map(x => new Types.ObjectId(x.id)),
            metricIds: visionReq.metrics.filter(x => x.id ? false : true).map(x => new Types.ObjectId(x.id))
        }

        let goalResponses =await Promise.all(newGoals.map(goal => this.goalRepository.add(new Goal().toEntity(goal, undefined, contextUser))));

        let metricResponses = await Promise.all(newMetrics.map(metric => this.measurableRepository.add(new Measurable().toEntity(metric, undefined, contextUser))));
        vision.goalIds = [...vision.goalIds, ...goalResponses.map(x => x._id)];
        vision.metricIds = [...vision.metricIds, ...metricResponses.map(x => x._id)];
        return vision;
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
