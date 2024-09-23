import { GoalStatus, GoalType, IGoalRequest, ITokenUser, ResponseInput } from "../models";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { User } from "./user";
import { IGoalResponse } from "../models/inerfaces/response/goal-response";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Schema, Types } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../utility";

export class Goal extends AccountEntityBase implements IToResponseBase<Goal, IGoalResponse> {
    title!: string;
    details!: string;
    status!: GoalStatus;
    type!: GoalType;
    dueDate!: Date;
    accountableId!: Types.ObjectId;
    accountable?: User
    milestones!: Array<IMilestone>;

    toResponse(entity?: ResponseInput<Goal>): IGoalResponse {

        if(!entity) entity = this;

        return {
            ...super.toAccountResponseBase(entity),
            title: entity.title,
            details: entity.details,
            status: entity.status,
            type: entity.type,
            dueDate: entity.dueDate,
            accountable: entity.accountable ? entity.accountable.toResponse(entity.accountable) : undefined,
            accountableId: entity.accountableId.toString(),
            milestones: entity.milestones
        }
    }

    toInstance (): Goal {
        return documentToEntityMapper<Goal>(new Goal, this)
    }
    
    toEntity = (entityRequest: IGoalRequest, id?: string, contextUser?: ITokenUser): Goal => {
        this.title = entityRequest.title;
        this.details = entityRequest.details;
        this.dueDate = entityRequest.dueDate;
        this.accountableId = new Types.ObjectId(entityRequest.accountableId);

        if(contextUser && !id){
            super.toAccountEntity(contextUser)
        }
        
        if(id && contextUser){
            super.toAccountEntity(contextUser, id)
        }

        this.milestones = entityRequest.milestones;
        return this;
    }
}

export interface IMilestone {
    details: string;
    dueDate: Date;
    completed: boolean;
} 


const milestoneSchema = new Schema<IMilestone>({
    details: { type: String, required: true },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, required: true },
});

export const goalSchema = new Schema<Goal>({
    title: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: Number, required: true },
    type: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    accountableId: { type: Schema.Types.ObjectId, ref: 'User' },
    milestones: [{ type: milestoneSchema }],
});

goalSchema.add(accountEntityBaseSchema)

goalSchema.loadClass(Goal);

goalSchema.virtual('accountable', {
    ref: 'User',
    localField: 'accountableId',
    foreignField: '_id',
    justOne: true,
});

export const goalModel = modelCreator<Goal, IGoalResponse>('Goal', goalSchema);
