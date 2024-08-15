import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { User } from "./user";
import { Vision } from "./vision";

@Entity("Measurable")
export class Measurable extends AccountEntityBase {
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

    @ManyToOne(() => Vision, (vision) => vision, {nullable: true, eager: true})
    @JoinColumn({ name: 'VisionId', referencedColumnName: 'id' })
    vision?: Vision
}