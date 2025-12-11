import { Goal } from "../../entities";
import { IGoalRequest, IGoalResponse, ITokenUser } from "../../models";
import { IServiceBase } from "./service-base";

export interface IGoalService extends IServiceBase<IGoalRequest, IGoalResponse, Goal> {
    toggleArchive(id: string, payload: { active: boolean }, contextUser: ITokenUser): Promise<void>;
    updatePriority(id: string, priority: number, contextUser: ITokenUser): Promise<void>;
}