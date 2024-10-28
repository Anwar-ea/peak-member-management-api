import { GoalStatus, GoalType } from "../../enums";
import { IMilestoneRequest } from "./milestone-rquest";

export interface IGoalRequest {
    id?: string;
    title: string;
    details: string;
    status: GoalStatus;
    type: GoalType;
    dueDate: Date;
    accountableId: string;
    milestones: Array<IMilestoneRequest>
}