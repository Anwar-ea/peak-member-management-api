import { IRepositoryBase } from "./repository-base";
import { Verification } from "../../entities";
import { IVerificationResponse } from "../../models";

export interface IVerificationRepository extends IRepositoryBase<Verification, IVerificationResponse> {
    
}