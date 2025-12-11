import { CallNote } from "../../entities";
import { ICallNoteRequest, ICallNoteResponse, ITokenUser } from "../../models";
import { IServiceBase } from "./service-base";

export interface ICallNoteService extends IServiceBase<ICallNoteRequest, ICallNoteResponse, CallNote> {
    toggleArchive(id: string, payload: { active: boolean }, contextUser: ITokenUser): Promise<void>;
}