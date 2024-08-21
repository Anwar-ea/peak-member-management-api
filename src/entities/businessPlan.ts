import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    RelationId,
} from 'typeorm';
import { MarketingStrategy } from './marketingStrategy';
import { Vision } from './vision';
import { AccountEntityBase } from './base-entities/account-entity-base';
import { IToResponseBase } from './abstractions/to-response-base';
import { IBusinessPlanRequest, IBusinessPlanResponse, ITokenUser } from '../models';

@Entity("BusinessPlan")
export class BusinessPlan extends AccountEntityBase implements IToResponseBase<BusinessPlan, IBusinessPlanResponse> {

    @Column({name: "CoreValues", type: "nvarchar", length: 'MAX' })
    coreValues!: string[];

    @Column({name:"Purpose", type: 'nvarchar', length: "MAX" })
    purpose!: string;

    @Column({ name: "Niche", type: 'nvarchar', length: "MAX" })
    niche!: string;

    @RelationId((businessPlan: BusinessPlan) => businessPlan.threeYearVision)
    threeYearVisionId!: string;
    
    @RelationId((businessPlan: BusinessPlan) => businessPlan.oneYearVision)
    oneYearVisionId!: string;
    
    @RelationId((businessPlan: BusinessPlan) => businessPlan.marketingStrategy)
    marketingStrategyId!: string;

    @OneToOne(() => MarketingStrategy, { nullable: false, eager: true, cascade: true})
    @JoinColumn({ name: 'MarketingStrategyId', referencedColumnName: 'id' })
    marketingStrategy!: MarketingStrategy;

    @OneToOne(() => Vision, { nullable: false, eager: true, cascade: true})
    @JoinColumn({ name: 'ThreeYearVisionId', referencedColumnName: 'id' })
    threeYearVision!: Vision;

    @OneToOne(() => Vision, { nullable: false, eager: true, cascade: true})
    @JoinColumn({ name: 'OneYearVisionId', referencedColumnName: 'id' })
    oneYearVision!: Vision;


    toEntity = (entityRequest: IBusinessPlanRequest , id?: string, contextUser?: ITokenUser): BusinessPlan => {
        this.coreValues = entityRequest.coreValues;
        this.purpose = entityRequest.purpose;
        this.niche = entityRequest.niche;
        
        if(contextUser && !id){
            super.toAccountEntity(contextUser);
        }
        
        if(id && contextUser){
            this.id = id;
            super.toAccountEntity(contextUser, true);
        }
        
        this.threeYearVision = new Vision().toEntity({...entityRequest.threeYearVision, businessPlanId: this.id}, undefined, contextUser);
        this.oneYearVision = new Vision().toEntity({...entityRequest.oneYearVision, businessPlanId: this.id}, undefined, contextUser);
        this.marketingStrategy = new MarketingStrategy().toEntity({...entityRequest.marketingStrategy, businessPlanId: this.id}, undefined, contextUser);
        this.threeYearVisionId = this.threeYearVision.id
        this.oneYearVisionId = this.oneYearVision.id;
        this.marketingStrategyId = this.marketingStrategy.id;
        return this;
    }

    toResponse(entity: BusinessPlan): IBusinessPlanResponse{
        return {
            ...super.toAccountResponseBase(entity),
            coreValues: entity.coreValues,
            purpose: entity.purpose,
            niche: entity.niche,
            marketingStrategyId: entity.marketingStrategyId,
            marketingStrategy: entity.marketingStrategy.toResponse(entity.marketingStrategy),
            threeYearVisionId: entity.threeYearVisionId,
            oneYearVisionId: entity.oneYearVisionId,
            threeYearVision: entity.threeYearVision.toResponse(entity.threeYearVision),
            oneYearVision: entity.oneYearVision.toResponse(entity.oneYearVision)
        };
    };

}