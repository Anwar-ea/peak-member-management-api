import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteGenericInterface, RouteHandlerMethod } from "fastify";

export type APIEndpoints = Array<{path: string; method: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH' | 'OPTIONS'; handler: RouteHandlerMethod, middlewares?: Array<preHandlerHookHandler>}>;