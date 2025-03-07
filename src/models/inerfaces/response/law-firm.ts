import { IAccountResponseBase } from "./response-base";

export interface ILawFirmResponse extends IAccountResponseBase {
    name: string;
    description?: string; 
}