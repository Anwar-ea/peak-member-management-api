export interface IIntuitCredsRequest {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiry: number;
    accessTokenExpiry: number;
    realmId: string;
    userId: string;
}