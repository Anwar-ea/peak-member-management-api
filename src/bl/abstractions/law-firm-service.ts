import { LawFirm } from "../../entities";
import { ILawFirmRequest, ILawFirmResponse, ITokenUser } from "../../models";
import { IDropdownResponse } from "../../models/inerfaces/response/dropdown-response";
import { IServiceBase } from "./service-base";

export interface ILawFirmService extends IServiceBase<ILawFirmRequest, ILawFirmResponse, LawFirm> {
        dropdown(accountId: string): Promise<IDropdownResponse[]>;
        toggleArchive(id: string, payload: { active: boolean }, contextUser: ITokenUser): Promise<void>;
}