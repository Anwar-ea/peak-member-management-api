import { Measurable } from "../../entities";
import { IMeasurableRequest, IMeasurableResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface IMeasurableService extends IServiceBase<IMeasurableRequest, IMeasurableResponse, Measurable> {
    
}