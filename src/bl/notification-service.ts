import { inject, injectable } from "tsyringe";
import { IDataSourceResponse, IFetchRequest, IFilter, ITokenUser } from "../models";
import { Notification } from "../entities/notification";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { INotificationService } from "./abstractions/notification-service";
import { INotificationRepository } from "../dal/abstractions/notification-repository";
import { INotificationResponse } from "../models/inerfaces/response/notification-response";
import { INotificationRequest } from "../models/inerfaces/request/notification-request";

@injectable()
export class NotificationService implements INotificationService {
    constructor(@inject('NotificationRepository') private readonly notificationRepository: INotificationRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Notification, keyof Notification>>): Promise<INotificationResponse | null> {
        return await this.notificationRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: INotificationRequest, contextUser?: ITokenUser): Promise<INotificationResponse> {
        let notification = new Notification().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.notificationRepository.add(notification);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: INotificationRequest[], contextUser: ITokenUser): Promise<INotificationResponse[]> {
        return (await this.notificationRepository.addRange(entitesRequest.map<Notification>(acc => {
            let notification = new Notification().toEntity(acc, undefined, contextUser);
            return notification;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Notification>): Promise<IDataSourceResponse<INotificationResponse>> {
        return await this.notificationRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<INotificationResponse | null> {
        return await this.notificationRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: INotificationRequest, contextUser: ITokenUser): Promise<INotificationResponse> {
        let notification = new Notification().toEntity(entityRequest, id, contextUser);
        return await this.notificationRepository.update(id, notification);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<INotificationRequest>, contextUser: ITokenUser): Promise<INotificationResponse> {
        let entity: Partial<Notification> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.notificationRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (INotificationRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.notificationRepository.updateRange(entitesRequest.map<Notification>(acc => {
            let notification = new Notification().toEntity(acc, acc.id, contextUser);
            return notification;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.notificationRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let notificationS = await this.notificationRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(notificationS.length !== ids.length) throw new Error(`Some notification with provided ids not found`);

    }
}
