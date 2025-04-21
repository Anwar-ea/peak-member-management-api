import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { VerificationService } from "../../bl";
import { FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { CommonRoutes } from "../../constants/commonRoutes";

@injectable()
export class VerificationController extends ControllerBase {
    constructor(@inject('VerificationService') private readonly verificationService: VerificationService){
        super('/verification');
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                handler: this.addVerification as RouteHandlerMethod
            },

            {
                method: 'POST',
                path: `verify`,
                handler: this.verify as RouteHandlerMethod
            },

        ];

    }


    
    private addVerification = async (req: FastifyRequest<{Body:{email: string, type: 'otp' | 'url'}}>, res: FastifyReply): Promise<void> => {
        const result = await this.verificationService.addVerification( req.body.email, req.body.type);
        res.send(result);
    }

    private getVerifications = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
        const result = await this.verificationService.getVerifications();
        res.send(result);
    }

    private deleteVerification = async (req: FastifyRequest<{Params:{id: string}}>, res: FastifyReply): Promise<void> => {
        const result = await this.verificationService.deleteVerification(req.params.id);
        res.send(result);
    }

    private verify = async (req: FastifyRequest<{Body: {token: string}}>, res: FastifyReply): Promise<void> => {
        const result = await this.verificationService.verify(req.body.token);
        res.send(result);
    }
}