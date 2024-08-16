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

@Entity("BusinessPlan")
export class BusinessPlan extends AccountEntityBase {

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

    @OneToOne(() => MarketingStrategy, { nullable: false, eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: 'MarketingStrategyId', referencedColumnName: 'id' })
    marketingStrategy!: MarketingStrategy;

    @OneToOne(() => Vision, { nullable: false, eager: true })
    @JoinColumn({ name: 'ThreeYearVisionId', referencedColumnName: 'id' })
    threeYearVision!: Vision;

    @OneToOne(() => Vision, { nullable: false, eager: true })
    @JoinColumn({ name: 'OneYearVisionId', referencedColumnName: 'id' })
    oneYearVision!: Vision;
}