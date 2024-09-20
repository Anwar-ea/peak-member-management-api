import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { Goal } from "./goal";
import { IMilestoneRequest, IMilestoneResponse, ITokenUser } from "../models";
import { Account } from "./account";
import { randomUUID } from "crypto";
import { IToResponseBase } from "./abstractions/to-response-base";

@Entity('Milestone')
export class Milestone extends AccountEntityBase implements IToResponseBase<Milestone, IMilestoneResponse>  {
    @Column({name: 'Details', type: 'text'})
    details!: string;

    @Column({name: 'DueDate', type: 'timestamp'})
    dueDate!: Date;

    @Column({name: 'Completed', type: 'boolean', default: false})
    completed!: boolean;

    @Column({name: "GoalId", nullable: false})
    goalId!: string;

    @ManyToOne(() => Goal, (goal) => goal, {nullable: false, onDelete: 'CASCADE', orphanedRowAction: 'delete'})
    @JoinColumn({name: 'GoalId', referencedColumnName: 'id'})
    goal!: Goal;
    
    toResponse(milestone: Milestone): IMilestoneResponse {
        return {
            ...super.toAccountResponseBase(milestone),
            details: milestone.details,
            dueDate: milestone.dueDate,
            completed: milestone.completed,
            goalId: milestone.goalId,
        }
    }

    
    toEntity = (entityRequest: IMilestoneRequest & {goalId: string}, contextUser?: ITokenUser): Milestone => {
        this.details = entityRequest.details;
        this.dueDate = entityRequest.dueDate;
        this.completed = entityRequest.completed;
        this.goalId = entityRequest.goalId;
        if(contextUser){
            this.createdBy = contextUser.name;
            this.createdAt = new Date();
            this.createdById = contextUser.id;
            this.active = true;
            this.accountId = contextUser.accountId;
            let account = new Account();
            account.id = contextUser.accountId;
            this.account = account;
            this.deleted = false;
            this.id = randomUUID();
        }

            let goal = new Goal();
            goal.id = entityRequest.goalId;
            this.goal = goal;

        return this;
    }
} 