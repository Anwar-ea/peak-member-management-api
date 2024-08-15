import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { CommonRoutes } from "../../constants";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../../models";
import { authorize } from "../../middlewares/authentication";
import { upload } from "../../utility";

@injectable()
export class UploadController extends ControllerBase {
    constructor(){
        super('/upload');
        this.endPoints = [
            {
                method: 'POST',
                path: "profile-picture",
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.uploadProfilePic as RouteHandlerMethod
            }
        ];

    }


    private uploadProfilePic = async (req: FastifyRequest, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        const file = await req.file()
        if(request.user && file){
            
            let url = await upload(file, request.user.id)
            res.send(url);
        }else {
            res.status(400).send({message: 'file not found'});
        }
    }

}