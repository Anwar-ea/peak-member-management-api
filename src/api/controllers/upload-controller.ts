import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { CommonRoutes } from "../../constants";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../../models";
import { authorize } from "../../middlewares/authentication";
import { upload } from "../../utility";
import { IUserService } from "../../bl";

@injectable()
export class UploadController extends ControllerBase {
    constructor(@inject('UserService') private readonly userService: IUserService){
        super('/upload');
        this.endPoints = [
            {
                method: 'POST',
                path: "profile_picture/:id",
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.uploadProfilePic as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: "cover_pic",
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.test as RouteHandlerMethod
            }
        ];

    }


    uploadProfilePic = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        const file = await req.file()
        if(request.user && file){
            
            let url = await upload(file, req.params.id);
            this.userService.partialUpdate(req.params.id,{pictureUrl: url}, request.user);
            res.send(url);
        }else {
            res.status(400).send({message: 'file not found'});
        }
    }

    test = async (req: FastifyRequest, res: FastifyReply) => {
        res.send('cover pic');
    }

}