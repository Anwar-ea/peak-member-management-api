import { StrategicPlanning } from "../../entities";
import { IStrategicPlanningRequest, IStrategicPlanningResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface IStrategicPlanningService extends IServiceBase<IStrategicPlanningRequest, IStrategicPlanningResponse, StrategicPlanning> {
    
}
