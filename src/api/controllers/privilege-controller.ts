import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { IPrivilegeService } from "../../bl";
import { CommonRoutes } from "../../constants";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest, IFetchRequest, IFilter } from "../../models";
import { Privilege } from "../../entities";
import { authorize } from "../../middlewares/authentication";

@injectable()
export class PrivilegeController extends ControllerBase {
    constructor(@inject('PrivilegeService') private readonly privilegeService: IPrivilegeService){
        super('/privilege');
        this.middleware = authorize  as preHandlerHookHandler;
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
                method: 'GET',
                path: CommonRoutes.getOneByQuery,
                handler: this.getOneByQuery as RouteHandlerMethod
            }
        ];

    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<Privilege>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.privilegeService.get(request.user, req.body))
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.privilegeService.getById(req.params.id, request.user));
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: Array<IFilter<Privilege, keyof Privilege>>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.privilegeService.getOne(request.user, req.body));
        }    
    }
}