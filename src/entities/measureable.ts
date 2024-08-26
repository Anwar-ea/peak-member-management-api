import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { User } from "./user";
import { Vision } from "./vision";
import { IToResponseBase } from "./abstractions/to-response-base";
import { IMeasurableRequest, IMeasurableResponse, ITokenUser } from "../models";

@Entity("Measurable")
export class Measurable extends AccountEntityBase implements IToResponseBase<Measurable, IMeasurableResponse> {
    @Column({name: "Name", type: "nvarchar", length: "max"})
    name!: string
    
    @Column({name: "Unit", type: "nvarchar", length: "max"})
    unit!: string

    @Column({name: "Goal", type: "int"})
    goal!: number

    @Column({name: "GoalMetric", type: "decimal"})
    goalMetric!: number

    @Column({name: "ShowAverage", type: "bit", default: false})
    showAverage!: boolean

    @Column({name: "ShowCumulative", type: "bit", default: false})
    showCumulative!: boolean

    @Column({name: "ApplyFormula", type: "bit", default: false})
    applyFormula!: boolean

    @Column({name: "AverageStartDate", type: "datetime", nullable: true})
    averageStartDate?: Date

    @Column({name: "CumulativeStartDate", type: "datetime", nullable: true})
    cumulativeStartDate?: Date

    @Column({name: "Formula", type: "nvarchar", length: "max", nullable: true})
    formula?: string

    @RelationId((measurable: Measurable) => measurable.accountable)
    accountableId!: string;

    @ManyToOne(() => User, (user) => user, {nullable: false, eager: true})
    @JoinColumn({ name: 'AccountableId', referencedColumnName: 'id' })
    accountable!: User

    @RelationId((measurable: Measurable) => measurable.vision)
    visionId?: string;

    @ManyToOne(() => Vision, (vision) => vision, {nullable: true})
    @JoinColumn({ name: 'VisionId', referencedColumnName: 'id' })
    vision?: Vision

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
        this.accountableId = entityRequest.accountableId;
        let user = new User();
        user.id = entityRequest.accountableId;
        this.accountable = user;

        if(contextUser && !id){
            super.toAccountEntity(contextUser);
        }
        
        if(id && contextUser){
            this.id = id;
            super.toAccountEntity(contextUser, true);
        }

        if(entityRequest.visionId){
            this.visionId = entityRequest.visionId;
            this.vision = new Vision();
            this.vision.id = entityRequest.visionId;
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
            accountableId: entity.accountableId,
            visionId: entity.visionId,
            vision: entity.vision ? entity.vision.toResponse(entity.vision) : undefined,
        };
    };

}