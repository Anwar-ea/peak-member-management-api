import { ToDo } from "../../entities";
import { IToDoRequest, IToDoResponse, ITokenUser } from "../../models";
import { IServiceBase } from "./service-base";

export interface IToDoService extends IServiceBase<IToDoRequest, IToDoResponse, ToDo> {
    updatePriority(id: string, priority: number, contextUser: ITokenUser): Promise<void>
}