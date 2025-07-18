import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";

export interface IIntuitCredsResponse extends IAccountResponseBase {
    accessToken?: string;
    refreshToken?: string;
    refreshTokenExpiry?: Date;
    accessTokenExpiry?: Date;
    realmId: string;
    userId: string;
    user?: IUserResponse;
    status: 'active' | 'expired'
}
