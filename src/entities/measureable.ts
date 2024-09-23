import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { User } from "./user";
import { IToResponseBase } from "./abstractions/to-response-base";
import { IMeasurableRequest, IMeasurableResponse, ITokenUser, ResponseInput } from "../models";
import { Schema, Types } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../utility";

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

    toInstance(): Measurable {
        return documentToEntityMapper<Measurable>(new Measurable, this);
    };

    toResponse(entity?: ResponseInput<Measurable>): IMeasurableResponse {
        if(!entity) entity = this;
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

export const measurableSchema = new Schema({
    name: { type: String, required: true },
    unit: { type: String, required: true },
    goal: { type: Number, required: true },
    goalMetric: { type: Number, required: true },
    showAverage: { type: Boolean, required: true },
    showCumulative: { type: Boolean, required: true },
    applyFormula: { type: Boolean, required: true },
    averageStartDate: { type: Date },
    cumulativeStartDate: { type: Date },
    formula: { type: String },
    accountableId: { type: Schema.Types.ObjectId, ref: "User" },
  });

measurableSchema.virtual("accountable", {
  ref: "User",
  localField: "accountableId",
  foreignField: "_id",
  justOne: true,
});

measurableSchema.add(accountEntityBaseSchema)

measurableSchema.loadClass(Measurable);

export const measurableModel = modelCreator<Measurable, IMeasurableResponse>('Measurable', measurableSchema);