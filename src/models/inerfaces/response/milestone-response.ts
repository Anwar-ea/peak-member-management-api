import { IAccountResponseBase } from "./response-base";

export interface IMilestoneResponse extends IAccountResponseBase {
    details: string;
    dueDate: Date;
    completed: boolean;
    goalId: string;
}