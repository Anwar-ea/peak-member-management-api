import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BusinessPlan } from "./businessPlan";
import { Goal } from "./goal";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { Measurable } from "./measureable";

@Entity("Vision")
export class Vision extends AccountEntityBase {

    @Column({ name: "FutureDate", type: 'datetime' })
    futureDate!: Date;

    @Column({ name: "Revenue", type: 'decimal', precision: 18, scale: 2 })
    revenue!: number;

    @Column({name: "Profit", type: 'decimal', precision: 18, scale: 2 })
    profit!: number;

    @ManyToOne(() => BusinessPlan, {cascade: true ,nullable: true, onDelete: 'CASCADE', orphanedRowAction: 'delete'})
    businessPlan!: BusinessPlan;

    @OneToMany(() => Goal, (goal) => goal.vision, { cascade: true, onDelete: "SET NULL" })
    goals!: Goal[];

    @OneToMany(() => Measurable, (measurable) => measurable.vision, { cascade: true, onDelete: "SET NULL" })
    metrics!: Measurable[];
}
