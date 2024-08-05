import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { ExtendedRequest, ITokenUser } from '../models';

config();

export const authorize = (req: ExtendedRequest, res: FastifyReply, done: HookHandlerDoneFunction) => {
  // Extract the token from the request headers, query parameters, or cookies
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using your secret key
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY || '');

    // Attach the decoded user data to the request object
    let user = decodedToken;
    req.user = user as ITokenUser;

    done();
  } catch (error) {
    return res.status(401).send({ message: 'Unauthorized Request' });
  }
};
