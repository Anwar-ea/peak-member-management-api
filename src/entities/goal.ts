import { GoalStatus, GoalType, IGoalRequest, ITokenUser } from "../models";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { User } from "./user";
import { IGoalResponse } from "../models/inerfaces/response/goal-response";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Types } from "mongoose";

export class Goal extends AccountEntityBase implements IToResponseBase<Goal, IGoalResponse> {
    title!: string;
    details!: string;
    status!: GoalStatus;
    type!: GoalType;
    dueDate!: Date;
    accountableId!: Types.ObjectId;
    accountable?: User
    milestones!: Array<IMilestone>;

    toResponse(entity: Goal): IGoalResponse {
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