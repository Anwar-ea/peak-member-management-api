
import { AccountEntityBase } from './base-entities/account-entity-base';
import { IToResponseBase } from './abstractions/to-response-base';
import { IBusinessPlanRequest, IBusinessPlanResponse, ITokenUser, IVisionRequest, IVisionResponse } from '../models';
import { Types } from 'mongoose';
import { Goal } from './goal';
import { Measurable } from './measureable';

export class BusinessPlan extends AccountEntityBase implements IToResponseBase<BusinessPlan, IBusinessPlanResponse> {
    coreValues!: Array<string>;
    purpose!: string;
    niche!: string;
    marketingStrategies!: Array<IMarketingStrategy>;
    threeYearVision!: IVision;
    oneYearVision!: IVision;


    toEntity = (entityRequest: IBusinessPlanRequest , id?: string, contextUser?: ITokenUser): BusinessPlan => {
        this.coreValues = entityRequest.coreValues;
        this.purpose = entityRequest.purpose;
        this.niche = entityRequest.niche;
        
        if(contextUser && !id){
            super.toAccountEntity(contextUser);
        }
        
        if(id && contextUser){
            super.toAccountEntity(contextUser, id);
        }

        if(contextUser){
            this.threeYearVision = visionRequstToEntity(entityRequest.threeYearVision, contextUser);
            this.oneYearVision = visionRequstToEntity(entityRequest.oneYearVision, contextUser);
        }
        
        this.marketingStrategies = entityRequest.marketingStrategies;

        return this;
    }

    toResponse(entity: BusinessPlan): IBusinessPlanResponse {
        return {
            ...super.toAccountResponseBase(entity),
            coreValues: entity.coreValues,
            purpose: entity.purpose,
            niche: entity.niche,
            marketingStrategies: entity.marketingStrategies,
            threeYearVision: visionEntityToRequst(entity.threeYearVision),
            oneYearVision: visionEntityToRequst(entity.oneYearVision)
        };
    };

}



export interface IMarketingStrategy {
    targetMarket: string;
    whoTheyAre: string;
    whereTheyAre: string;
    whatTheyAre: string;
    provenProcess: string;
    guarantee: string;
}

export interface IVision {
    futureDate: Date;
    revenue: number;
    profit: number;
    goalIds: Array<Types.ObjectId>;
    metricIds: Array<Types.ObjectId>;
    goals?: Array<Goal>;
    metrics?: Array<Measurable>;
}

const visionRequstToEntity = (req: IVisionRequest, contextUser: ITokenUser): IVision => {
    let goals = req.goals.map(g => new Goal().toEntity(g, undefined, contextUser));
    let metrics = req.metrics.map(m => new Measurable().toEntity(m, undefined, contextUser));
    return {
        futureDate: req.futureDate,
        revenue: req.revenue,
        profit: req.profit,
        goalIds: goals.map(g => g._id),
        metricIds: metrics.map(m => m._id),
        goals: goals,
        metrics: metrics
    }
}

const visionEntityToRequst = (ent: IVision): IVisionResponse => {
    return {
        futureDate: ent.futureDate,
        revenue: ent.revenue,
        profit: ent.profit,
        goalIds: ent.goalIds.map(g => g._id.toString()),
        metricIds: ent.metricIds.map(m => m._id.toString()),
        goals: ent.goals ? ent.goals.map(g => g.toResponse(g)) : undefined,
        metrics: ent.metrics ? ent.metrics.map(m => m.toResponse(m)) : undefined
    }
}
