import { ToDo } from "../../entities";
import { IToDoRequest, IToDoResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface IToDoService extends IServiceBase<IToDoRequest, IToDoResponse, ToDo> {
    
}