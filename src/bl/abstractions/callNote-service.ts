import { CallNote } from "../../entities";
import { ICallNoteRequest, ICallNoteResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface ICallNoteService extends IServiceBase<ICallNoteRequest, ICallNoteResponse, CallNote> {
    
}