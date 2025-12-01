import { StrategicPlanning, strategicPlanningModel } from "../entities";
import { IStrategicPlanningResponse } from "../models";
import { IStrategicPlanningRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class StrategicPlanningRepository extends GenericRepository<StrategicPlanning, IStrategicPlanningResponse> implements IStrategicPlanningRepository {

    constructor () {
        super(strategicPlanningModel);
    }
    
}
