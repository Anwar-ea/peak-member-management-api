import { Measurable } from "../../entities";
import { IMeasurableRequest, IMeasurableResponse, ITokenUser } from "../../models";
import { IServiceBase } from "./service-base";

export interface IMeasurableService extends IServiceBase<IMeasurableRequest, IMeasurableResponse, Measurable> {
    toggleArchive(id: string, payload: { active: boolean }, contextUser: ITokenUser): Promise<void>;
    updatePriority(id: string, newPriority: number, contextUser: ITokenUser): Promise<void>;
}