import { AccountEntityBase } from "./base-entities/account-entity-base";
import { User } from "./user";
import { IToResponseBase } from "./abstractions/to-response-base";
import { IMeasurableRequest, IMeasurableResponse, ITokenUser } from "../models";
import { Types } from "mongoose";

export class Measurable extends AccountEntityBase implements IToResponseBase<Measurable, IMeasurableResponse> {
    name!: string
    unit!: string
    goal!: number
    goalMetric!: number
    showAverage!: boolean
    showCumulative!: boolean
    applyFormula!: boolean
    averageStartDate?: Date
    cumulativeStartDate?: Date
    formula?: string
    accountableId!: Types.ObjectId;
    accountable?: User

    toEntity = (entityRequest: IMeasurableRequest & {visionId?: string} , id?: string, contextUser?: ITokenUser): Measurable => {
        this.name = entityRequest.name;
        this.unit = entityRequest.unit;
        this.goal = entityRequest.goal;
        this.goalMetric = entityRequest.goalMetric;
        this.showAverage = entityRequest.showAverage;
        this.showCumulative = entityRequest.showCumulative;
        this.applyFormula = entityRequest.applyFormula;
        this.averageStartDate = entityRequest.averageStartDate;
        this.cumulativeStartDate = entityRequest.cumulativeStartDate;
        this.formula = entityRequest.formula;
        this.accountableId = new Types.ObjectId(entityRequest.accountableId);

        if(contextUser && !id){
            super.toAccountEntity(contextUser);
        }
        
        if(id && contextUser){
            super.toAccountEntity(contextUser, id);
        }

        return this;
    }

    toResponse(entity: Measurable): IMeasurableResponse {
        return {
            ...super.toAccountResponseBase(entity),
            name: entity.name,
            unit: entity.unit,
            goal: entity.goal,
            goalMetric: entity.goalMetric,
            showAverage: entity.showAverage,
            showCumulative: entity.showCumulative,
            applyFormula: entity.applyFormula,
            averageStartDate: entity.averageStartDate,
            cumulativeStartDate: entity.cumulativeStartDate,
            formula: entity.formula,
            accountableId: entity.accountableId.toString(),
            accountable: entity.accountable ? entity.accountable.toResponse(entity.accountable) : undefined,
        };
    };

}