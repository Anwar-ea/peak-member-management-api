import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { authorize } from "../../middlewares/authentication";
import { IReportingService } from "../../bl/abstractions/reporting-service";

@injectable()
export class ReportingController extends ControllerBase {
    constructor(@inject('ReportingService') private readonly reportingService: IReportingService) {
        super('/reporting');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
            {
                method: 'GET',
                path: 'revenues',
                handler: this.getAll as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: `revenues/:userId`,
                handler: this.getByUserId as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: `totals`,
                handler: this.reportTotals as RouteHandlerMethod
            }
        ];

    }

    private getAll = async (req: FastifyRequest, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(await this.reportingService.get(request.user))
        }
    }

    private getByUserId = async (req: FastifyRequest<{Params: {userId: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.reportingService.get(request.user, req.params.userId));
        }
    }

    private reportTotals =async (req: FastifyRequest, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.reportingService.reportTotals(request.user.accountId));
        }
    }
}