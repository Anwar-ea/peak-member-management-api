import { injectable, inject } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { IAccountService } from "../../bl";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { APIEndpoints, IAccountRequest, IFetchRequest, IFilter } from "../../models";
import { Account } from "../../entities";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { CommonRoutes } from "../../constants/commonRoutes";
import { authorize } from "../../middlewares/authentication";

@injectable()
export class AccountController extends ControllerBase {
    constructor(@inject('AccountService') private readonly accountService: IAccountService) {
        super('/account');
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                handler: this.addAccount as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: CommonRoutes.getAll,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.getAll as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: `${CommonRoutes.getById}/:id`,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.getById as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: CommonRoutes.getOneByQuery,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.getOneByQuery as RouteHandlerMethod
            },
            {
                method: 'PUT',
                path: `${CommonRoutes.update}/:id`,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.update as RouteHandlerMethod
            },
            {
                method: 'DELETE',
                path: `${CommonRoutes.delete}/:id`,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.delete as RouteHandlerMethod
            }
        ];
    }

    private addAccount = async (req: FastifyRequest<{Body: IAccountRequest}>, res: FastifyReply) => {
        res.send(await this.accountService.addNewAccount(req.body))
    }

    private getAll = async (req: FastifyRequest<{Body: IFetchRequest<Account> | undefined}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.accountService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.accountService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: Array<IFilter<Account, keyof Account>>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.accountService.getOne(request.user, req.body));
        }    
    }

    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.accountService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: IAccountRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.accountService.update(req.params.id, req.body, request.user));
        }  
    }

}