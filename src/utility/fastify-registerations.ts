import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import cors from '@fastify/cors'
import {container} from 'tsyringe'
import { registerRepositories } from "../dal/register/repositories-register";
import { registerServices } from "../bl/register/services-register";
import { registerControllers } from "../api/controllers/register/controllers-register";
import { ControllerBase } from "../api/controllers/generics/controller-base";

export const fastifyRegisters = async (fastify: FastifyInstance) => {
    await fastify.register(cors, {
        origin: '*',
        methods: ['GET', 'PUT', 'DELETE', 'PATCH', 'POST']
    });
    registerRepositories(container);
    registerServices(container);
    const controllers = registerControllers(container);

    await fastify.register((fi: FastifyInstance, options: FastifyPluginOptions, done) => {
        Object.values(controllers).forEach((controller) => {
            controller.getRouter(fi);
        })
        done();
    }, {prefix: '/api'});
}