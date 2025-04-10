import { IRepositoryBase } from "./repository-base";
import { CustomMeasurableValue } from "../../entities";
import { ICustomMeasurableValueResponse } from "../../models";

export interface ICustomMeasurableValueRepository extends IRepositoryBase<CustomMeasurableValue, ICustomMeasurableValueResponse> {
    
}