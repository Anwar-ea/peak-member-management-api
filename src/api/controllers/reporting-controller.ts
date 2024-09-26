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
                path: 'revenue',
                handler: this.getAll as RouteHandlerMethod
            }
        ];

    }

    private getAll = async (req: FastifyRequest, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.reportingService.get())
    }
}