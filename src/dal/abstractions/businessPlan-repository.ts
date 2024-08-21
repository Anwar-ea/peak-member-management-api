import { BusinessPlan } from "../../entities";
import { IBusinessPlanResponse } from "../../models";
import { IRepositoryBase } from "./repository-base";

export interface IBusinessPlanRepository extends IRepositoryBase<BusinessPlan, IBusinessPlanResponse> {
    
}