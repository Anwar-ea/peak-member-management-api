import { Notification, notificationModel } from "../entities";
import { INotificationResponse } from "../models/inerfaces/response/notification-response";
import { INotificationRepository } from "./abstractions/notification-repository";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class NotificationRepository extends GenericRepository<Notification, INotificationResponse> implements INotificationRepository {
    constructor () {
        super(notificationModel);
    }
}