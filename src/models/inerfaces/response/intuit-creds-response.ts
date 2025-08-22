import { IntuitUserProfile } from "../intuit";
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
    env: 'sandbox' | 'production';
    status: 'active' | 'expired';
    userProfile?: IntuitUserProfile;
}
