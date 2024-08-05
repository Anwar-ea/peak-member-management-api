import { Goal } from "../../entities";
import { IRepositoryBase } from "./repository-base";
import { IGoalResponse } from "../../models";

export interface IGoalRepository extends IRepositoryBase<Goal, IGoalResponse> {
    
}