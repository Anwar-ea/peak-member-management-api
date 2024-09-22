import { IAccountResponseBase } from "./response-base";

export interface IMilestoneResponse {
    details: string;
    dueDate: Date;
    completed: boolean;
}