import { CalenderEvent } from "../../entities";
import { ICalenderEventRequest, ICalenderEventResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface ICalenderEventService extends IServiceBase<ICalenderEventRequest, ICalenderEventResponse, CalenderEvent> {
    
}