import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { IFetchRequest, IFilter } from "../../models";
import { CommonRoutes } from "../../constants/commonRoutes";
import { authorize } from "../../middlewares/authentication";
import { INotificationService } from "../../bl/abstractions/notification-service";
import { INotificationRequest } from "../../models/inerfaces/request/notification-request";
import { Notification } from "../../entities/notification";

@injectable()
export class NotificationController extends ControllerBase {
    constructor(@inject('NotificationService') private readonly notificationService: INotificationService) {
        super('/notification');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                handler: this.add as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: CommonRoutes.getAll,
                handler: this.getAll as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: `${CommonRoutes.getById}/:id`,
                handler: this.getById as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: CommonRoutes.getOneByQuery,
                handler: this.getOneByQuery as RouteHandlerMethod
            },
            {
                method: 'PUT',
                path: `${CommonRoutes.update}/:id`,
                handler: this.update as RouteHandlerMethod
            },
            {
                method: 'DELETE',
                path: `${CommonRoutes.delete}/:id`,
                handler: this.delete as RouteHandlerMethod
            }
        ];

    }

    
    private add = async (req: FastifyRequest<{Body: INotificationRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.notificationService.add(req.body, request.user))
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<Notification>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.notificationService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.notificationService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: Array<IFilter<Notification, keyof Notification>>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.notificationService.getOne(request.user, req.body));
        }    
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.notificationService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: INotificationRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.notificationService.update(req.params.id, req.body, request.user));
        }  
    }
}