import { injectable } from "tsyringe";
import { GenericRepository } from "./generics/repository";
import { IntuitCreds, IntuitCredsModel } from "../entities";
import { IIntuitCredsResponse } from "../models";

@injectable()
export class IntuitCredsRepository extends GenericRepository<IntuitCreds, IIntuitCredsResponse> {
    constructor(){
        super(IntuitCredsModel);
    }

}