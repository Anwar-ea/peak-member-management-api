import { Goal } from "../../entities";
import { IGoalRequest, IGoalResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface IGoalService extends IServiceBase<IGoalRequest, IGoalResponse, Goal> {
    
}