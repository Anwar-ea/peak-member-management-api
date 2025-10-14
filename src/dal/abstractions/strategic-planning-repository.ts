import { StrategicPlanning } from "../../entities";
import { IRepositoryBase } from "./repository-base";
import { IStrategicPlanningResponse } from "../../models";

export interface IStrategicPlanningRepository extends IRepositoryBase<StrategicPlanning, IStrategicPlanningResponse> {
    
}
