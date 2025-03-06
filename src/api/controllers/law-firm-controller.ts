import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { ILawFirmService } from "../../bl";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { IFetchRequest, IFilter, ILawFirmRequest } from "../../models";
import { LawFirm } from "../../entities";
import { CommonRoutes } from "../../constants/commonRoutes";
import { authorize } from "../../middlewares/authentication";

@injectable()
export class LawFirmController extends ControllerBase {
    constructor(@inject('LawFirmService') private readonly lawFirmService: ILawFirmService){
        super('/law-firm');
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
                method: 'GET',
                path: `dropdown`,
                handler: this.dropDown as RouteHandlerMethod
            },
            {
                method: 'DELETE',
                path: `${CommonRoutes.delete}/:id`,
                handler: this.delete as RouteHandlerMethod
            }
        ];

    }

    
    private add = async (req: FastifyRequest<{Body: ILawFirmRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.lawFirmService.add(req.body, request.user))
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<LawFirm>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.lawFirmService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.lawFirmService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: Array<IFilter<LawFirm, keyof LawFirm>>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.lawFirmService.getOne(request.user, req.body));
        }    
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.lawFirmService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: ILawFirmRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.lawFirmService.update(req.params.id, req.body, request.user));
        }  
    }

    private dropDown = async (req: FastifyRequest, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.lawFirmService.dropdown(request.user.accountId));
        }  
    }


}