import { BusinessPlan } from "../../entities";
import { IBusinessPlanRequest, IBusinessPlanResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface IBusinessPlanService extends IServiceBase<IBusinessPlanRequest, IBusinessPlanResponse, BusinessPlan> {
    
}