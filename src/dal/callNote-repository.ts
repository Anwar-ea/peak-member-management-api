import { CallNote, callNoteModel } from "../entities";
import { ICallNoteResponse } from "../models";
import { ICallNoteRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class CallNoteRepository extends GenericRepository<CallNote, ICallNoteResponse> implements ICallNoteRepository {
    constructor () {
        super(callNoteModel);
        this.populate = ['user']
    }
}