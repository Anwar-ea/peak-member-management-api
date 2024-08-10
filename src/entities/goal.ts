import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, RelationId } from "typeorm";
import { GoalStatus, GoalType, IGoalRequest, IModuleResponse, ITokenUser } from "../models";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { User } from "./user";
import { Milestone } from "./milestone";
import { IGoalResponse } from "../models/inerfaces/response/goal-response";
import { Account } from "./account";
import { randomUUID } from "crypto";
import { IToResponseBase } from "./abstractions/to-response-base";

@Entity('Goal')
export class Goal extends AccountEntityBase implements IToResponseBase<Goal, IGoalResponse> {
    
    @Column({name: 'Title', type: 'nvarchar'})
    title!: string;

    @Column({name: 'Details', type: 'nvarchar'})
    details!: string;

    @Column({name: 'Status', type: 'int', default: GoalStatus.OnTrack})
    status!: GoalStatus;

    @Column({name: 'Type', type: 'int', default: GoalType.Individual})
    type!: GoalType;

    @Column({name: 'DueDate', type: 'datetime'})
    dueDate!: Date;

    @RelationId((goal: Goal) => goal.accountable)
    accountableId!: string;

    @ManyToOne(() => User, (user) => user, {nullable: false, eager: true})
    @JoinColumn({ name: 'AccountableId', referencedColumnName: 'id' })
    accountable!: User

        
    @OneToMany(() => Milestone, (milestone) => milestone.goal, {cascade: true, onDelete: 'CASCADE', eager: true})
    milestones!: Array<Milestone>;

    toResponse(entity: Goal): IGoalResponse {
        return {
            ...super.toAccountResponseBase(entity),
            title: entity.title,
            details: entity.details,
            status: entity.status,
            type: entity.type,
            dueDate: entity.dueDate,
            accountable: entity.accountable.toResponse(entity.accountable),
            accountableId: entity.accountableId,
            milestones: entity.milestones.map(m => m.toResponse(m))
        }
    }

    
    toEntity = (entityRequest: IGoalRequest , id?: string, contextUser?: ITokenUser): Goal => {
        this.title = entityRequest.title;
        this.details = entityRequest.details;
        this.dueDate = entityRequest.dueDate;
        this.accountableId = entityRequest.accountableId;
        let user = new User();
        user.id = entityRequest.accountableId;
        this.accountable = user;

        if(contextUser && !id){
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
        
        if(id && contextUser){
            this.id = id;
            this.modifiedBy = contextUser.name;
            this.modifiedAt = new Date();
            this.modifiedById = contextUser.id;
            this.active = true;
            this.accountId = contextUser.accountId;
            let account = new Account();
            account.id = contextUser.accountId;
            this.account = account;
            this.deleted = false;
        }

        this.milestones = entityRequest.milestones.map(milestone => {
            let ms = new Milestone().toEntity({...milestone, goalId: this.id}, contextUser);
            return ms;
        });

        return this;
    }
}