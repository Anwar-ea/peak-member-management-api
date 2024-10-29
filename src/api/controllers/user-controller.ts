import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { IUserService } from "../../bl";
import { CommonRoutes } from "../../constants";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest, IFetchRequest, IFilter, ILoginRequest, IUserRequest } from "../../models";
import { User } from "../../entities";
import { authorize } from "../../middlewares/authentication";
import { IResetPassword } from "../../models/inerfaces/request/resetPasswordRequest";

@injectable()
export class UserController extends ControllerBase {
    constructor(@inject('UserService') private readonly userService: IUserService){
        super('/user');
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.add as RouteHandlerMethod
            },
            {
                method: 'POST',
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
                method: 'POST',
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
            },
            {
                method: 'POST',
                path: 'login',
                handler: this.login as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: 'reset_password',
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.resetPassword as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'dropdown',
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.dropdown as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'login_as_member/:id',
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.loginAsMember as RouteHandlerMethod
            }
        ];

    }

    private login = async (req: FastifyRequest<{Body: ILoginRequest}>, res: FastifyReply) => {
            res.send(await this.userService.login(req.body));
    }

    private loginAsMember = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        res.send(await this.userService.loginAsMember(req.params.id));
    }

    private add = async (req: FastifyRequest<{Body: IUserRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.userService.add(req.body, request.user))
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<User>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.userService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.userService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: Array<IFilter<User, keyof User>>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.userService.getOne(request.user, req.body));
        }    
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.userService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: IUserRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.userService.update(req.params.id, req.body, request.user));
        }  
    }

    private resetPassword = async (req: FastifyRequest<{Body: IResetPassword}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.userService.resetPassword(req.body, request.user));
        }  
    }

    private dropdown = async (req: FastifyRequest, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(await this.userService.dropdown(request.user.accountId));
        }
    }
}