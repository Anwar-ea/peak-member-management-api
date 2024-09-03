import { Entity, Column, OneToOne, JoinColumn, RelationId } from "typeorm";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { BusinessPlan } from "./businessPlan";
import { IToResponseBase } from "./abstractions/to-response-base";
import { IBusinessPlanRequest, IMarketingStrategyRequest, IMarketingStrategyResponse, ITokenUser } from "../models";

@Entity("MarketingStrategy")
export class MarketingStrategy extends AccountEntityBase implements IToResponseBase<MarketingStrategy, IMarketingStrategyResponse> {

    @Column({name: "TargtMarket" ,type: 'text' })
    targetMarket!: string;

    @Column({ name: "WhoTheyAre", type: 'text' })
    whoTheyAre!: string;

    @Column({ name: "WhereTheyAre",type: 'text' })
    whereTheyAre!: string;

    @Column({ name: "WhatTheyAre",type: 'text' })
    whatTheyAre!: string;

    @Column({ name: "ProvenProcess", type: 'text' })
    provenProcess!: string;

    @Column({ name: "Guarantee", type: 'text' })
    guarantee!: string;

        
    @RelationId((marketingStrategy: MarketingStrategy) => marketingStrategy.businessPlan)
    businessPlanId!: string;

    @OneToOne(() => BusinessPlan, {cascade: true, onDelete: 'CASCADE'})
    @JoinColumn({name: 'BusinessPlanId', referencedColumnName: "id"})
    businessPlan!: BusinessPlan;

    toEntity = (entityRequest: IMarketingStrategyRequest & {businessPlanId: string} , id?: string, contextUser?: ITokenUser): MarketingStrategy => {
        this.targetMarket = entityRequest.targetMarket;
        this.whoTheyAre = entityRequest.whoTheyAre;
        this.whereTheyAre = entityRequest.whereTheyAre;
        this.whatTheyAre = entityRequest.businessPlanId;
        this.provenProcess = entityRequest.provenProcess;
        this.guarantee = entityRequest.guarantee;
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

        return this;
    }
    
    toResponse(entity: MarketingStrategy): IMarketingStrategyResponse{
        return {
            ...super.toAccountResponseBase(entity),
            targetMarket: entity.targetMarket,
            whoTheyAre: entity.whoTheyAre,
            whereTheyAre: entity.whereTheyAre,
            whatTheyAre: entity.whatTheyAre,
            provenProcess: entity.provenProcess,
            guarantee: entity.guarantee,
            businessPlanId: entity.businessPlanId,
            businessPlan: entity.businessPlan? entity.businessPlan.toResponse(entity.businessPlan) : undefined,
        };
    };

}