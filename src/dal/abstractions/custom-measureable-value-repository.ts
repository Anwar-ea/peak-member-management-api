import { IRepositoryBase } from "./repository-base";
import { CustomMeasureableValue } from "../../entities";
import { ICustomMeasureableValueResponse } from "../../models";

export interface ICustomMeasureableValueRepository extends IRepositoryBase<CustomMeasureableValue, ICustomMeasureableValueResponse> {
    
}