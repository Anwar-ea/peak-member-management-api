import { IntuitUserProfile } from "../intuit";

export interface IIntuitCredsRequest {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiry: number;
    accessTokenExpiry: number;
    env: "sandbox" | "production";
    realmId: string;
    userId: string;
    userProfile?: IntuitUserProfile;
}