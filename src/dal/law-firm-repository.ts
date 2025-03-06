import { LawFirm, lawFirmModel } from "../entities";
import { ILawFirmResponse } from "../models";
import { ILawFirmRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class LawFirmRepository extends GenericRepository<LawFirm, ILawFirmResponse> implements ILawFirmRepository {

    constructor () {
        super(lawFirmModel);
    }

    
}