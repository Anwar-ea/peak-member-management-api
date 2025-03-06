import { LawFirm } from "../../entities";
import { IRepositoryBase } from "./repository-base";
import { ILawFirmResponse } from "../../models";

export interface ILawFirmRepository extends IRepositoryBase<LawFirm, ILawFirmResponse> {
    
}