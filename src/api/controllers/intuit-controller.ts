import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { IntuitCredsService } from "../../bl";
import {
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
  RouteHandlerMethod,
} from "fastify";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { IToDoRequest, ITokenUser } from "../../models";
import { CommonRoutes } from "../../constants/commonRoutes";
import { authorize } from "../../middlewares/authentication";
import { getAuthUri } from "../../utility";

@injectable()
export class IntuitController extends ControllerBase {
  constructor(
    @inject("IntuitCredsService") private readonly service: IntuitCredsService,
  ) {
    super("/intuit");
    this.endPoints = [
      {
        method: "GET",
        path: "login",
        handler: this.login as RouteHandlerMethod,
        middlewares: [authorize as preHandlerHookHandler],
      },
      {
        method: "GET",
        path: "auth",
        handler: this.auth as RouteHandlerMethod,
      },
      {
        method: "GET",
        path: `get_by_user_id/:id`,
        handler: this.getByUserId as RouteHandlerMethod,
        middlewares: [authorize as preHandlerHookHandler],
      },
      {
        method: "GET",
        path: `financial-overview`,
        handler: this.financialOverView as RouteHandlerMethod,
        middlewares: [authorize as preHandlerHookHandler],
      },
      {
        method: "GET",
        path: `monthly-trends`,
        handler: this.monthlyTrends as RouteHandlerMethod,
        middlewares: [authorize as preHandlerHookHandler],
      },
      {
        method: "GET",
        path: `top-sources-expences`,
        handler: this.topSourcesAndExpences as RouteHandlerMethod,
        middlewares: [authorize as preHandlerHookHandler],
      },
      {
        method: "GET",
        path: `check-login`,
        handler: this.isLogedIn as RouteHandlerMethod,
        middlewares: [authorize as preHandlerHookHandler],
      },
      {
        method: "DELETE",
        path: `logout/:userId`,
        handler: this.logout as RouteHandlerMethod,
        middlewares: [authorize as preHandlerHookHandler],
      }
    ];
  }

  private login = async (req: FastifyRequest<{Querystring:{env: 'sandbox' | 'production'}}>, res: FastifyReply) => {
    let { user } = req as ExtendedRequest;
    const response = {url: getAuthUri(JSON.stringify({ ...(user as ITokenUser), privileges: undefined, env: req.query.env }), req.query.env)};
    res.send(response)
  };

  private auth = async (
    req: FastifyRequest<{
      Querystring?: { realmId?: string; code?: string; state?: string;};
    }>,
    res: FastifyReply,
  ) => {
    let { realmId, code, state } = req.query!;
    if (!realmId || !code || !state)
      throw new Error("There was an error while logging into intuit.");
      let {env, ...rest} = JSON.parse(state);
    await this.service.login(code, realmId, env, rest);
    res.redirect(`${process.env.APP_BASE_URL as string}/quick-books?env=${env}`);
  };

  private getByUserId = async (
    req: FastifyRequest<{ Params: { id: string }, Querystring:{env: 'sandbox' | 'production'} }>,
    res: FastifyReply,
  ) => {
    let request = req as ExtendedRequest;

    res.send(
      await this.service.getByUserId(req.params.id, req.query.env, request.user as ITokenUser),
    );
  };

  private isLogedIn = async (req: FastifyRequest<{Querystring:{env: 'sandbox' | 'production'}}>, res: FastifyReply) => {
        let {user} = req as ExtendedRequest;

        const creds = await this.service.getByUserId(user?.id as string, req.query.env, user as ITokenUser);
        res.send({status: creds && creds.status === 'active' ? 'active' : 'expired', profile: creds?.userProfile})
  }

  private financialOverView = async (
    req: FastifyRequest<{Querystring:{env: 'sandbox' | 'production'}}>,
    res: FastifyReply,
  ) => {
    let request = req as ExtendedRequest;
    res.send(
      await this.service.getFinancialOverview(request.user as ITokenUser, req.query.env),
    );
  };

  private monthlyTrends = async (req: FastifyRequest<{Querystring:{env: 'sandbox' | 'production'}}>, res: FastifyReply) => {
    let request = req as ExtendedRequest;
    res.send(await this.service.getMonthlyTrends(request.user as ITokenUser, req.query.env));
  };

  private topSourcesAndExpences = async (
    req: FastifyRequest<{Querystring:{env: 'sandbox' | 'production'}}>,
    res: FastifyReply,
  ) => {
    let request = req as ExtendedRequest;
    res.send(
      await this.service.getTopSourcesExpences(request.user as ITokenUser, req.query.env),
    );
  };

  private logout = async (req: FastifyRequest<{Params: {userId: string}}>, res: FastifyReply) => {
    res.send(await this.service.deleteCreds(req.params.userId));
  };

  private update = async (
    req: FastifyRequest<{ Body: IToDoRequest; Params: { id: string } }>,
    res: FastifyReply,
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(
        await this.service.update(req.params.id, req.body as any, request.user),
      );
    }
  };
  
}
