import axios from "axios";
import { stringify } from "querystring";
const intuitCreds = {
  clientId: process.env.INTUIT_CLIENT_ID!,
  clientSecret: process.env.INTUIT_CLIENT_SECRET!,
  environment: process.env.INTUIT_ENVIRONMENT! as "sandbox" | "production",
  redirectUri: process.env.INTUIT_REDIRECT_URI!,
  logging: true,
  scope: ["com.intuit.quickbooks.accounting", "com.intuit.quickbooks.payment", "openid", "profile", "email", "phone", "address"],
};
const INTUIT_BASE = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
export const getAuthUri = (state?: string) => {
  return encodeURI(`https://appcenter.intuit.com/connect/oauth2?client_id=${intuitCreds.clientId}&redirect_uri=${intuitCreds.redirectUri}&response_type=code&scope=${intuitCreds.scope.join(" ")}&state=${state}`);
};
export interface TokenResponse {
  expires_in: number
  x_refresh_token_expires_in: number
  access_token: string
  refresh_token: string
  token_type: string
}

export const getTokenFromCallback = async (code: string): Promise<TokenResponse> => {
  const credentials = Buffer.from(
    `${intuitCreds.clientId}:${intuitCreds.clientSecret}`,
  ).toString("base64");

  return (
    await axios.post(
      INTUIT_BASE,
      stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: intuitCreds.redirectUri,
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
    )
  ).data;
};

export const refreshToken = async (refreshToken: string): Promise<TokenResponse> => {
  const credentials = Buffer.from(
    `${intuitCreds.clientId}:${intuitCreds.clientSecret}`,
  ).toString("base64");

  return (
    await axios.post(
      INTUIT_BASE,
      stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
    )
  ).data;
};

export const validateAccessToken = async (accessToken: string) => {
  const credentials = Buffer.from(
    `${intuitCreds.clientId}:${intuitCreds.clientSecret}`,
  ).toString("base64");

  return (
    await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/introspect",
      stringify({
        token: accessToken,
        token_type_hint: "access_token",
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
    )
  ).data;
};
