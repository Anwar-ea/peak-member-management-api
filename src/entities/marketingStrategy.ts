import { Entity, Column, OneToOne, JoinColumn, RelationId } from "typeorm";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { BusinessPlan } from "./businessPlan";

@Entity("MarketingStrategy")
export class MarketingStrategy extends AccountEntityBase {

    @Column({name: "TargtMarket" ,type: 'nvarchar', length: "MAX" })
    targetMarket!: string;

    @Column({ name: "WhoTheyAre", type: 'nvarchar', length: "MAX" })
    whoTheyAre!: string;

    @Column({ name: "WhereTheyAre",type: 'nvarchar', length: "MAX" })
    whereTheyAre!: string;

    @Column({ name: "WhatTheyAre",type: 'nvarchar', length: "MAX" })
    whatTheyAre!: string;

    @Column({ name: "ProvenProcess", type: 'nvarchar', length: "MAX" })
    provenProcess!: string;

    @Column({ name: "Guarantee", type: 'nvarchar', length: "MAX" })
    guarantee!: string;

        
    @RelationId((marketingStrategy: MarketingStrategy) => marketingStrategy.businessPlan)
    marketingStrategyId!: string;

    @OneToOne(() => BusinessPlan, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'BusinessPlanId', referencedColumnName: "id"})
    businessPlan!: BusinessPlan;
}