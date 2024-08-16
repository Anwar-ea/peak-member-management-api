import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { IModuleService } from "../../bl";
import { RouteHandlerMethod, FastifyRequest, FastifyReply, preHandlerHookHandler } from "fastify";
import { CommonRoutes } from "../../constants";
import { IFetchRequest, ExtendedRequest, IFilter } from "../../models";
import { Module } from "../../entities";
import { authorize } from "../../middlewares/authentication";

@injectable()
export class ModuleController extends ControllerBase {
    constructor(@inject('ModuleService') private readonly moduleService: IModuleService){
        super('/module');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
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
            }
        ];
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<Module>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.moduleService.get(request.user, req.body))
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.moduleService.getById(req.params.id, request.user));
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: Array<IFilter<Module, keyof Module>>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.moduleService.getOne(request.user, req.body));
        }    
    }
}