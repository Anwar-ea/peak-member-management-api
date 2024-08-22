import { Column, Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from "typeorm";
import { GoalStatus, GoalType, IGoalRequest, IModuleResponse, ITokenUser } from "../models";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { User } from "./user";
import { Milestone } from "./milestone";
import { IGoalResponse } from "../models/inerfaces/response/goal-response";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Vision } from "./vision";

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

    
    @RelationId((goal: Goal) => goal.vision)
    visionId?: string;

    @ManyToOne(() => Vision, (vision) => vision, {nullable: true})
    @JoinColumn({ name: 'VisionId', referencedColumnName: 'id' })
    vision?: Vision
    
    @OneToMany(() => Milestone, (milestone) => milestone.goal, {eager: true, cascade: true, orphanedRowAction: 'delete'})
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

    
    toEntity = (entityRequest: IGoalRequest & {visionId?: string} , id?: string, contextUser?: ITokenUser): Goal => {
        this.title = entityRequest.title;
        this.details = entityRequest.details;
        this.dueDate = entityRequest.dueDate;
        this.accountableId = entityRequest.accountableId;
        let user = new User();
        user.id = entityRequest.accountableId;
        this.accountable = user;

        if(contextUser && !id){
            super.toAccountEntity(contextUser)
        }
        
        if(id && contextUser){
            super.toAccountEntity(contextUser, true)
            this.id = id;
        }

        if(entityRequest.visionId){
            this.visionId = entityRequest.visionId;
            this.vision = new Vision();
            this.vision.id = entityRequest.visionId;
        }

        this.milestones = entityRequest.milestones.map(milestone => {
            let ms = new Milestone().toEntity({...milestone, goalId: this.id}, contextUser);
            return ms;
        });

        return this;
    }
}