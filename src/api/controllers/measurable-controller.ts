import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { IMeasurableService } from "../../bl";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { IFetchRequest, IFilter, IMeasurableRequest } from "../../models";
import { Measurable } from "../../entities";
import { CommonRoutes } from "../../constants/commonRoutes";
import { authorize } from "../../middlewares/authentication";

@injectable()
export class MeasurableController extends ControllerBase {
    constructor(@inject('MeasurableService') private readonly measurableService: IMeasurableService){
        super('/measurable');
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
            },
            {
                method: 'PUT',
                path: `toggle-active/:id`,
                handler: this.toggleActive as RouteHandlerMethod
            }
        ];

    }

    
    private add = async (req: FastifyRequest<{Body: IMeasurableRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.measurableService.add(req.body, request.user))
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<Measurable>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.measurableService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.measurableService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: Array<IFilter<Measurable, keyof Measurable>>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.measurableService.getOne(request.user, req.body));
        }    
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.measurableService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: IMeasurableRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.measurableService.update(req.params.id, req.body, request.user));
        }  
    }

    private toggleActive = async (
        req: FastifyRequest<{ Params: { id: string }; Body: { active: boolean } }>,
        res: FastifyReply
    ) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(
                await this.measurableService.toggleArchive(
                    req.params.id,
                    req.body,
                    request.user
                )
            );
        }
    };
}