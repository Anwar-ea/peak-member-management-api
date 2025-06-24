import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { IntuitCredsService } from "../../bl";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { IToDoRequest, ITokenUser } from "../../models";
import { CommonRoutes } from "../../constants/commonRoutes";
import { authorize } from "../../middlewares/authentication";
import { getAuthUri } from "../../utility";

@injectable()
export class IntuitController extends ControllerBase {
    constructor(@inject('IntuitCredsService') private readonly service: IntuitCredsService){
        super('/intuit');
        this.endPoints = [
            {
                method: 'GET',
                path: 'login',
                handler: this.login as RouteHandlerMethod,
                middlewares: [authorize as preHandlerHookHandler]
            },
            {
                method: 'GET',
                path: 'auth',
                handler: this.auth as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: `${CommonRoutes.getById}/:id`,
                handler: this.getByUserId as RouteHandlerMethod,
                middlewares: [authorize as preHandlerHookHandler]
            },
            {
                method: 'PUT',
                path: `${CommonRoutes.update}/:id`,
                handler: this.update as RouteHandlerMethod,
                middlewares: [authorize as preHandlerHookHandler]
            }
        ];

    }

    
    private login = async (req: FastifyRequest, res: FastifyReply) => {
        let {user} = req as ExtendedRequest;
        res.redirect(getAuthUri(JSON.stringify({...(user as ITokenUser), privileges:undefined})));
    }

    private auth = async (req: FastifyRequest<{Querystring?: {realmId?: string, code?: string, state?: string}}>, res: FastifyReply) => {
        let {realmId, code, state} = req.query!;
        if(!realmId || !code || !state) throw new Error('There was an error while logging into intuit.')
        await this.service.login(code, realmId, JSON.parse(state))
        res.redirect(process.env.QUICK_BOOKS_URL as string)
    }

    private getByUserId = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.service.getById(req.params.id, request.user as ITokenUser));
        if(request.user){
        }
    }



    private update = async (req: FastifyRequest<{Body: IToDoRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.service.update(req.params.id, req.body as any, request.user));
        }  
    }


}