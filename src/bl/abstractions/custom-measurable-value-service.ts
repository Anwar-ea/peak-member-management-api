import { CustomMeasurableValue } from "../../entities";
import { ICustomMeasurableValueRequest, ICustomMeasurableValueResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface ICustomMeasurableValueService extends IServiceBase<ICustomMeasurableValueRequest, ICustomMeasurableValueResponse, CustomMeasurableValue> {
    
}