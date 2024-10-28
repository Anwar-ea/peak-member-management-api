
import { AccountEntityBase, accountEntityBaseSchema } from './base-entities/account-entity-base';
import { IToResponseBase } from './abstractions/to-response-base';
import { IBusinessPlanRequest, IBusinessPlanResponse, ITokenUser, IVisionRequest, IVisionResponse, ResponseInput } from '../models';
import { Schema, Types } from 'mongoose';
import { Goal } from './goal';
import { Measurable } from './measureable';
import { documentToEntityMapper, modelCreator } from '../utility';

export class BusinessPlan extends AccountEntityBase implements IToResponseBase<BusinessPlan, IBusinessPlanResponse> {
    coreValues!: Array<string>;
    purpose!: string;
    yourWhy!: string;
    threeYearVision!: IVision;
    oneYearVision!: IVision;

    toEntity = (entityRequest: IBusinessPlanRequest , id?: string, contextUser?: ITokenUser): BusinessPlan => {
        this.coreValues = entityRequest.coreValues;
        this.purpose = entityRequest.purpose;
        this.yourWhy = entityRequest.yourWhy;
        
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
        
        return this;
    }

    toInstance(): BusinessPlan {
        return documentToEntityMapper<BusinessPlan>(new BusinessPlan(), this)
    }

    toResponse(entity?: ResponseInput<BusinessPlan>): IBusinessPlanResponse {
        if(!entity) entity = this;
        return {
            ...super.toAccountResponseBase(entity),
            coreValues: entity.coreValues,
            purpose: entity.purpose,
            yourWhy: entity.yourWhy,
            threeYearVision: visionEntityToRequst(entity.threeYearVision),
            oneYearVision: visionEntityToRequst(entity.oneYearVision)
        };
    };

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

const visionEntityToRequst = (ent: ResponseInput<IVision>): IVisionResponse => {
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


const visionSchema = new Schema({
    futureDate: { type: Date, required: true },
    revenue: { type: Number, required: true },
    profit: { type: Number, required: true },
    goalIds: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
    metricIds: [{ type: Schema.Types.ObjectId, ref: 'Measurable' }],
});

// Virtual populate for goals

// Ensure virtuals are included in JSON output
visionSchema.set('toJSON', { virtuals: true });

export const businessPlanSchema =  new Schema<BusinessPlan>({
    coreValues: [{ type: String, required: true }],
    purpose: { type: String, required: true },
    yourWhy: { type: String, required: true },
    threeYearVision: { type: visionSchema, required: true },
    oneYearVision: { type: visionSchema, required: true },
});
businessPlanSchema.virtual('threeYearVision.goals', {
    ref: 'Goal',
    localField: 'threeYearVision.goalIds',
    foreignField: '_id',
    justOne: false,
});
// Virtual populate for metrics
businessPlanSchema.virtual('oneYearVision.metrics', {
    ref: 'Measurable',
    localField: 'oneYearVision.metricIds',
    foreignField: '_id',
    justOne: false,
});
businessPlanSchema.virtual('oneYearVision.goals', {
    ref: 'Goal',
    localField: 'oneYearVision.goalIds',
    foreignField: '_id',
    justOne: false,
});

// Virtual populate for metrics
businessPlanSchema.virtual('threeYearVision.metrics', {
    ref: 'Measurable',
    localField: 'threeYearVision.metricIds',
    foreignField: '_id',
    justOne: false,
});


businessPlanSchema.add(accountEntityBaseSchema)

businessPlanSchema.loadClass(BusinessPlan);

export const businessPlanModel = modelCreator<BusinessPlan, IBusinessPlanResponse>('BusinessPlan', businessPlanSchema);

