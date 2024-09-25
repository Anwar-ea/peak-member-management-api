import { Notification } from "../../entities/notification";
import { IRepositoryBase } from "./repository-base";
import { INotificationResponse } from "../../models/inerfaces/response/notification-response";

export interface INotificationRepository extends IRepositoryBase<Notification, INotificationResponse> {
    
}