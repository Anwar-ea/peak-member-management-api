import { IRepositoryBase } from "./repository-base";
import { CalenderEvent } from "../../entities";
import { ICalenderEventResponse } from "../../models";

export interface ICalenderEventRepository extends IRepositoryBase<CalenderEvent, ICalenderEventResponse> {
    
}