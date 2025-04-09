import { CustomMeasureableValue } from "../../entities";
import { ICustomMeasureableValueRequest, ICustomMeasureableValueResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface ICustomMeasureableValueService extends IServiceBase<ICustomMeasureableValueRequest, ICustomMeasureableValueResponse, CustomMeasureableValue> {
    
}