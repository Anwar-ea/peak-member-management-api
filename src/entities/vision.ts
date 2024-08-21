import { Entity, Column, ManyToOne, OneToMany, RelationId, OneToOne } from "typeorm";
import { BusinessPlan } from "./businessPlan";
import { Goal } from "./goal";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { Measurable } from "./measureable";
import { ITokenUser, IVisionRequest, IVisionResponse } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";

@Entity("Vision")
export class Vision extends AccountEntityBase implements IToResponseBase<Vision, IVisionResponse>{

    @Column({ name: "FutureDate", type: 'datetime' })
    futureDate!: Date;

    @Column({ name: "Revenue", type: 'decimal', precision: 18, scale: 2 })
    revenue!: number;

    @Column({name: "Profit", type: 'decimal', precision: 18, scale: 2 })
    profit!: number;

    @RelationId((vision: Vision) => vision.businessPlan)
    businessPlanId!: string;

    @OneToOne(() => BusinessPlan, {cascade: true ,nullable: false, onDelete: 'CASCADE', orphanedRowAction: 'delete'})
    businessPlan?: BusinessPlan;

    @OneToMany(() => Goal, (goal) => goal.vision, { cascade: true, onDelete: "SET NULL" })
    goals!: Goal[];

    @OneToMany(() => Measurable, (measurable) => measurable.vision, { cascade: true, onDelete: "SET NULL" })
    metrics!: Measurable[];

    toEntity = (entityRequest: IVisionRequest & {businessPlanId: string} , id?: string, contextUser?: ITokenUser): Vision => {
        this.futureDate = entityRequest.futureDate;
        this.revenue = entityRequest.revenue;
        this.profit = entityRequest.profit;
        this.businessPlanId = entityRequest.businessPlanId;
        this.businessPlan = new BusinessPlan();
        this.businessPlan.id = entityRequest.businessPlanId;


        if(contextUser && !id){
            super.toAccountEntity(contextUser);
        }
        
        if(id && contextUser){
            this.id = id;
            super.toAccountEntity(contextUser, true);
        }

        this.goals = entityRequest.goals.map(goalReq => {
            return new Goal().toEntity({...goalReq, visionId: this.id}, undefined, contextUser);
        });

        this.metrics = entityRequest.metrics.map(metricReq => {
            return new Measurable().toEntity({...metricReq, visionId: this.id}, undefined, contextUser);
        });

        return this;
    }

    toResponse(entity: Vision): IVisionResponse {
        return {
           ...super.toAccountResponseBase(entity),
            futureDate: entity.futureDate,
            revenue: entity.revenue,
            profit: entity.profit,
            businessPlanId: entity.businessPlanId,
            businessPlan: entity.businessPlan ? entity.businessPlan.toResponse(entity.businessPlan) : undefined,
            goals: entity.goals? entity.goals.map(goal => goal.toResponse(goal)) : undefined,
            metrics: entity.metrics? entity.metrics.map(metric => metric.toResponse(metric)) : undefined,
        };
    };

}
