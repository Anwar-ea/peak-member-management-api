import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { IFetchRequest, IFilter } from "../../models";
import { CommonRoutes } from "../../constants/commonRoutes";
import { authorize } from "../../middlewares/authentication";
import { CustomMeasurableValue } from "../../entities";
import { ICustomMeasurableValueRequest } from "../../models";
import { ICustomMeasurableValueService } from "../../bl";

@injectable()
export class CustomMeasurableValueController extends ControllerBase {
    constructor(@inject('CustomMeasurableValueService') private readonly revenueService: ICustomMeasurableValueService){
        super('/custom_measurable_value');
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
    
    private add = async (req: FastifyRequest<{Body: ICustomMeasurableValueRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.revenueService.add(req.body, request.user))
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<CustomMeasurableValue>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.revenueService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.revenueService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: Array<IFilter<CustomMeasurableValue, keyof CustomMeasurableValue>>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.revenueService.getOne(request.user, req.body));
        }    
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.revenueService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: ICustomMeasurableValueRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.revenueService.update(req.params.id, req.body, request.user));
        }  
    }
}