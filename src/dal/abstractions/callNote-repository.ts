import { IRepositoryBase } from "./repository-base";
import { CallNote } from "../../entities";
import { ICallNoteResponse } from "../../models";

export interface ICallNoteRepository extends IRepositoryBase<CallNote, ICallNoteResponse> {
    
}