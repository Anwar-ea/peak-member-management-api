import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { IToDoService, ToDoService } from "../../bl";
import {
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
  RouteHandlerMethod,
} from "fastify";
import { ExtendedRequest } from "../../models/inerfaces/extended-Request";
import { IFetchRequest, IFilter, IToDoRequest, ITokenUser } from "../../models";
import { ToDo } from "../../entities";
import { CommonRoutes } from "../../constants/commonRoutes";
import { authorize } from "../../middlewares/authentication";

@injectable()
export class ToDoController extends ControllerBase {
  constructor(
    @inject("ToDoService") private readonly toDoService: ToDoService
  ) {
    super("/toDo");
    this.middleware = authorize as preHandlerHookHandler;
    this.endPoints = [
      {
        method: "POST",
        path: CommonRoutes.create,
        handler: this.add as RouteHandlerMethod,
      },
      {
        method: "POST",
        path: CommonRoutes.getAll,
        handler: this.getAll as RouteHandlerMethod,
      },
      {
        method: "GET",
        path: `${CommonRoutes.getById}/:id`,
        handler: this.getById as RouteHandlerMethod,
      },
      {
        method: "POST",
        path: CommonRoutes.getOneByQuery,
        handler: this.getOneByQuery as RouteHandlerMethod,
      },
      {
        method: "PUT",
        path: `${CommonRoutes.update}/:id`,
        handler: this.update as RouteHandlerMethod,
      },
      {
        method: "PUT",
        path: `complete/:id`,
        handler: this.complete as RouteHandlerMethod,
      },
      {
        method: "PUT",
        path: `incomplete/:id`,
        handler: this.incomplete as RouteHandlerMethod,
      },
      {
        method: "DELETE",
        path: `${CommonRoutes.delete}/:id`,
        handler: this.delete as RouteHandlerMethod,
      },
      {
        method: "PUT",
        path: `update_priority`,
        handler: this.changePriority as RouteHandlerMethod,
      },
      {
        method: "PUT",
        path: `toggle-active/:id`,
        handler: this.toggleActive as RouteHandlerMethod,
      },
      {
        method: "DELETE",
        path: `soft-delete/:id`,
        handler: this.softDelete as RouteHandlerMethod,
      },
    ];
  }

  private add = async (
    req: FastifyRequest<{ Body: IToDoRequest }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(await this.toDoService.add(req.body, request.user));
    }
  };

  private getAll = async (
    req: FastifyRequest<{ Body?: IFetchRequest<ToDo> }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    res.send(await this.toDoService.get(request.user as ITokenUser, req.body!));
    if (request.user) {
    }
  };

  private getById = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    res.send(
      await this.toDoService.getById(req.params.id, request.user as ITokenUser)
    );
    if (request.user) {
    }
  };

  private getOneByQuery = async (
    req: FastifyRequest<{ Body: Array<IFilter<ToDo, keyof ToDo>> }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(await this.toDoService.getOne(request.user, req.body));
    }
  };

  private delete = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(await this.toDoService.delete(req.params.id, request.user));
    }
  };

  private update = async (
    req: FastifyRequest<{ Body: IToDoRequest; Params: { id: string } }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(
        await this.toDoService.update(req.params.id, req.body, request.user)
      );
    }
  };

  private complete = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(
        await this.toDoService.partialUpdate(
          req.params.id,
          { completed: true },
          request.user
        )
      );
    }
  };

  private incomplete = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(
        await this.toDoService.partialUpdate(
          req.params.id,
          { completed: false },
          request.user
        )
      );
    }
  };

  private changePriority = async (
    req: FastifyRequest<{ Body: { id: string; priority: number } }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(
        await this.toDoService.updatePriority(
          req.body.id,
          req.body.priority,
          request.user
        )
      );
    }
  };

  private toggleActive = async (
    req: FastifyRequest<{ Params: { id: string }; Body: { active: boolean } }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(
        await this.toDoService.toggleArchive(
          req.params.id,
          req.body,
          request.user
        )
      );
    }
  };

  private softDelete = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
  ) => {
    let request = req as ExtendedRequest;

    if (request.user) {
      res.send(await this.toDoService.softDelete(req.params.id, request.user));
    }
  };
}
