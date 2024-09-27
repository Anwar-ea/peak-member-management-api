import { inject, injectable } from "tsyringe";
import { ICallNoteRequest, ICallNoteResponse, IDataSourceResponse, IFetchRequest, IFilter, ITokenUser } from "../models";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { ICallNoteService } from "./abstractions";
import { ICallNoteRepository } from "../dal";
import { CallNote } from "../entities";

@injectable()
export class CallNoteService implements ICallNoteService {
    constructor(@inject('CallNoteRepository') private readonly callNoteRepository: ICallNoteRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<CallNote, keyof CallNote>>): Promise<ICallNoteResponse | null> {
        return await this.callNoteRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: ICallNoteRequest, contextUser?: ITokenUser): Promise<ICallNoteResponse> {
        let callNote = new CallNote().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.callNoteRepository.add(callNote);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: ICallNoteRequest[], contextUser: ITokenUser): Promise<ICallNoteResponse[]> {
        return (await this.callNoteRepository.addRange(entitesRequest.map<CallNote>(acc => {
            let callNote = new CallNote().toEntity(acc, undefined, contextUser);
            return callNote;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<CallNote>): Promise<IDataSourceResponse<ICallNoteResponse>> {
        return await this.callNoteRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<ICallNoteResponse | null> {
        return await this.callNoteRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: ICallNoteRequest, contextUser: ITokenUser): Promise<ICallNoteResponse> {
        let callNote = new CallNote().toEntity(entityRequest, id, contextUser);
        return await this.callNoteRepository.update(id, callNote);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<ICallNoteRequest>, contextUser: ITokenUser): Promise<ICallNoteResponse> {
        let entity: Partial<CallNote> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.callNoteRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (ICallNoteRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.callNoteRepository.updateRange(entitesRequest.map<CallNote>(acc => {
            let callNote = new CallNote().toEntity(acc, acc.id, contextUser);
            return callNote;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.callNoteRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let revenues = await this.callNoteRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(revenues.length !== ids.length) throw new Error(`Some calender event with provided ids not found`);

    }
}
