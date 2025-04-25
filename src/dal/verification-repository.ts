import { Verification, verificationModel } from "../entities";
import { IVerificationResponse } from "../models";
import { IVerificationRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class VerificationRepository extends GenericRepository<Verification, IVerificationResponse> implements IVerificationRepository {
    constructor () {
        super(verificationModel);
        this.populate = []
    }
}