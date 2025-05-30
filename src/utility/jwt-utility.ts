import { sign, verify } from "jsonwebtoken";
import { ITokenUser } from "../models";
import { config } from "dotenv";
config()
export const signJwt = (user: ITokenUser, tokenSecret: string | null = null, expiryTime: string | null = null): string => {        
    return sign(user, tokenSecret ?? (process.env.TOKEN_SECRET_KEY ?? '') , { expiresIn: expiryTime ?? '3 hours' });
}
export const signVerificationJwt = (data: Record<string, unknown>, tokenSecret: string | null = null, expiryTime: string | null = null): string => {        
    return sign(data, tokenSecret ?? (process.env.TOKEN_SECRET_KEY ?? '') , { expiresIn: expiryTime ?? '3 hours' });
}

export const verifyJwt = (jwt: string, tokenSecret: string | null = null, ignoreExpiration: boolean = false): boolean => {
    let user = verify(jwt, tokenSecret ?? (process.env.TOKEN_SECRET_KEY ?? ''), );
    if (!user) return false;
    return true;
}