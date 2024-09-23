import { BusinessPlan, businessPlanModel } from "../entities";
import { IBusinessPlanResponse } from "../models";
import { IBusinessPlanRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class BusinessPlanRepository extends GenericRepository<BusinessPlan, IBusinessPlanResponse> implements IBusinessPlanRepository {

    constructor () {
        super(businessPlanModel);
        this.populate = ['threeYearVision.goals', 'oneYearVision.metrics', 'oneYearVision.goals', 'threeYearVision.metrics']

    }

}