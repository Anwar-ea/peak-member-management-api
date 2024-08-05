import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, HookHandlerDoneFunction, preHandlerHookHandler } from "fastify";
import { injectable } from "tsyringe";
import { APIEndpoints } from "../../../models";
import { log } from "console";

@injectable()
export class ControllerBase {
  controllerPath!: string;
  public endPoints: APIEndpoints = [];
  middleware?:preHandlerHookHandler ; 

  constructor (path: string) {
    this.controllerPath = path;

  }

  getRouter = (fastify: FastifyInstance) => {
    fastify.register(
      (controller: FastifyInstance, options: FastifyPluginOptions, done: HookHandlerDoneFunction) => {
        if(this.middleware) controller.addHook('onRequest',this.middleware)
        for (const ep of this.endPoints) {
          switch (ep.method) {
            case "GET":
              controller.get(`/${ep.path}`, {preHandler: ep.middlewares}, ep.handler);
              break;
            case "PUT":
              controller.put(`/${ep.path}`, {preHandler: ep.middlewares}, ep.handler);
              break;
            case "POST":
              controller.post(`/${ep.path}`, {preHandler: ep.middlewares}, ep.handler);
              break;
            case "DELETE":
              controller.delete(`/${ep.path}`, {preHandler: ep.middlewares}, ep.handler);
              break;
            case "PATCH":
              controller.patch(`/${ep.path}`, {preHandler: ep.middlewares}, ep.handler);
              break;
            case "OPTIONS":
              controller.options(`/${ep.path}`, {preHandler: ep.middlewares}, ep.handler);
              break;
            default:
              break;
          }
        }

        done();
      },
      { prefix: this.controllerPath }
    );
  };
}
