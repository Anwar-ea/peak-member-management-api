import { GoalStatus, GoalType } from "../../enums";
import { IMilestoneResponse } from "./milestone-response";
import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";

export interface IGoalResponse extends IAccountResponseBase {
    title: string;
    details: string;
    status: GoalStatus;
    type: GoalType;
    dueDate: Date;
    accountableId: string;
    milestones: Array<IMilestoneResponse>;
    accountable: IUserResponse
}