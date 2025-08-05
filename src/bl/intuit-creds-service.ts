import { inject, injectable } from "tsyringe";
import { IntuitCredsRepository } from "../dal";
import {
  IIntuitCredsRequest,
  IIntuitCredsResponse,
  IDataSourceResponse,
  IFetchRequest,
  IFilter,
} from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { IntuitCreds } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import {
  getTokenFromCallback,
  refreshToken,
  validateAccessToken,
  getFinancialOverview,
  getMonthlyRevenueAndExpensesTrend,
  getTopIncomeSources,
  getTopExpenses,
  getUserProfile
} from "../utility";
import moment from "moment";

@injectable()
export class IntuitCredsService {
  constructor(
    @inject("IntuitCredsRepository")
    private readonly IntuitCredsRepository: IntuitCredsRepository,
  ) {}

  async addNew(
    entityRequest: IIntuitCredsRequest,
    contextUser: ITokenUser,
  ): Promise<IIntuitCredsResponse> {
    let intuitCreds = new IntuitCreds().toEntity(entityRequest, contextUser);
    return (await this.IntuitCredsRepository.add(intuitCreds)).toResponse();
  }

  async login(
    code: string,
    realmId: string,
    env: 'sandbox' | 'production',
    contextUser: ITokenUser,
  ): Promise<IIntuitCredsResponse> {
    let {
      access_token,
      refresh_token,
      expires_in,
      x_refresh_token_expires_in,
    } = await getTokenFromCallback(code);
    let profileRes = await getUserProfile(access_token, env);
    let {sub, email, familyName, givenName, phoneNumber, emailVerified,realmId: userRealmId} = profileRes;
    const creds = await this.IntuitCredsRepository.findOne({
      userId: contextUser.id,
      env
    });

    if (creds)
      return await this.partialUpdate(
        contextUser.id,
        env,
        {
          accessToken: access_token,
          refreshToken: refresh_token,
          accessTokenExpiry: expires_in,
          refreshTokenExpiry: x_refresh_token_expires_in,
          realmId,
          userId: contextUser.id,
          userProfile:{
            sub,
            email,
            familyName, 
            givenName, 
            phoneNumber,
            emailVerified, 
            realmId
          }
        },
        contextUser,
      );
    else
      return await this.addNew(
        {
          accessToken: access_token,
          refreshToken: refresh_token,
          accessTokenExpiry: expires_in,
          refreshTokenExpiry: x_refresh_token_expires_in,
          realmId,
          env,
          userProfile:{
            sub,
            email,
            familyName, 
            givenName, 
            phoneNumber,
            emailVerified, 
            realmId
          },
          userId: contextUser.id,
        },
        contextUser,
      );
  }

  async getOne(
    contextUser: ITokenUser,
    filtersRequest: Array<IFilter<IntuitCreds, keyof IntuitCreds>>,
  ): Promise<IIntuitCredsResponse | null> {
    let result = await this.IntuitCredsRepository.getOneByQuery(
      filtersRequest,
      true,
      true,
      contextUser.accountId,
    );
    return result ? result.toResponse() : null;
  }

  async get(
    contextUser: ITokenUser,
    fetchRequest: IFetchRequest<IntuitCreds>,
  ): Promise<IDataSourceResponse<IIntuitCredsResponse>> {
    return await this.IntuitCredsRepository.getPagedData(
      fetchRequest,
      true,
      true,
      contextUser.accountId,
    );
  }

  async getByUserId(
    userId: string,
    env: 'sandbox' | 'production',
    contextUser: ITokenUser,
  ): Promise<IIntuitCredsResponse | null> {
    const result = await this.IntuitCredsRepository.findOne({
      userId,
      refreshTokenExpiry: { $gt: new Date() },
      status: "active",
    });
    const verifiedCreds = result ? result.toResponse() : null;
    if (result && result?.checkExpiaryStatus("accessToken"))
      return verifiedCreds;
    else if (result && result?.checkExpiaryStatus("refreshToken"))
      return await this.updateAccessToken(userId,env, contextUser);
    else return verifiedCreds;
  }

  async update(
    userId: string,
    entityRequest: IIntuitCredsRequest,
    contextUser: ITokenUser,
  ): Promise<IIntuitCredsResponse> {
    let intuitCreds = new IntuitCreds().toEntity(entityRequest);
    intuitCreds.modifiedAt = new Date();
    intuitCreds.modifiedById = new Types.ObjectId(contextUser.id);
    intuitCreds.modifiedBy = contextUser.name;
    return await this.IntuitCredsRepository.findOneAndUpdate(
      { userId: userId },
      intuitCreds,
    );
  }

  async partialUpdate(
    userId: string,
    env: 'sandbox' | 'production',
    partialEntity: Partial<IIntuitCredsRequest>,
    contextUser: ITokenUser,
  ): Promise<IIntuitCredsResponse> {
    let entity: Partial<IntuitCreds> = {
      modifiedAt: new Date(),
      modifiedById: new Types.ObjectId(contextUser.id),
      modifiedBy: contextUser.name,
      status:
        partialEntity.accessToken && partialEntity.accessTokenExpiry
          ? "active"
          : "expired",
      accessTokenExpiry: partialEntity.accessTokenExpiry
        ? moment().add(partialEntity.accessTokenExpiry, "seconds").toDate()
        : undefined,
      refreshTokenExpiry: partialEntity.refreshTokenExpiry
        ? moment().add(partialEntity.refreshTokenExpiry, "seconds").toDate()
        : undefined,
    };

    return await this.IntuitCredsRepository.findOneAndUpdate(
      { userId, env },
      assignIn(entity, partialEntity),
    );
  }

  async expireSession(userId: string, contextUser: ITokenUser): Promise<void> {
    let entity: Partial<IntuitCreds> = {
      modifiedAt: new Date(),
      modifiedById: new Types.ObjectId(contextUser.id),
      modifiedBy: contextUser.name,
      status: "expired",
      accessToken: undefined,
      refreshToken: undefined,
      accessTokenExpiry: undefined,
      refreshTokenExpiry: undefined,
    };
    await this.IntuitCredsRepository.findOneAndUpdate({ userId }, entity);
  }

  async getFinancialOverview(contextUser: ITokenUser, env: 'sandbox' | 'production'): Promise<unknown> {
    const { accessToken, realmId } = await this.getUpdatedToken(
      contextUser.id,
      env,
      contextUser,
    );
    try{

        return await getFinancialOverview(accessToken, realmId, env);
    } catch(err){
        throw err
    }
  }

  async getMonthlyTrends(
    contextUser: ITokenUser,
    env: 'sandbox' | 'production'
  ): Promise<Array<{ month: string; revenue: number; expenses: number }>> {
    const { accessToken, realmId } = await this.getUpdatedToken(
      contextUser.id,
      env,
      contextUser,
    );
    return await getMonthlyRevenueAndExpensesTrend(accessToken, realmId, env);
  }

  async getTopSourcesExpences(
    contextUser: ITokenUser,
    env: 'sandbox' | 'production'
  ): Promise<{ income: any; expenses: any }> {
    const { accessToken, realmId } = await this.getUpdatedToken(
      contextUser.id,
      env,
      contextUser,
    );
    const income = await getTopIncomeSources(accessToken, realmId, env);
    const expenses = await getTopExpenses(accessToken, realmId, env);
      const totalExpenses = expenses.reduce<number>((acc, el) => acc += el.amount, 0)
  const top4Expenses: Array<{name: string, amount:number}> = expenses.reduce<Array<{name: string, amount:number}>>((acc, el) => {
    if(el.name.toLowerCase().includes('expense')){
      const summaries = el.rows.filter(x => (x.Header && x.Summary)).map(x => ({name: x.Summary!.ColData[0].value.replace("Total ", ""),
      amount: parseFloat(x.Summary!.ColData[1]?.value || "0"),}));
        acc = [...acc, ...summaries]
      }
      if(el.rows.length === 1) acc = [...acc, {name: el.rows[0].ColData![0].value, amount: parseFloat(el.rows[0].ColData![1].value ?? '0')}]
    return acc;
  }, []).sort((a, b)=> b.amount - a.amount).slice(0,5);
  const topExpenses: Array<{name: string, amount:number}> = [...top4Expenses];
    return { income:income, expenses: topExpenses };
  }

  async getUpdatedToken(
    userId: string,
    env: 'sandbox' | 'production',
    contextUser: ITokenUser,
  ): Promise<{ accessToken: string; realmId: string }> {
    const creds = await this.IntuitCredsRepository.findOne({ userId, env });
    if (creds) {
      if (creds.checkExpiaryStatus("accessToken"))
        return {
          accessToken: creds.accessToken as string,
          realmId: creds.realmId,
        };
      const updatedCreds = await this.updateAccessToken(userId, env, contextUser);
      return {
        accessToken: updatedCreds.accessToken as string,
        realmId: updatedCreds.realmId,
      };
    } else {
      throw new Error("Intuit credentials not found");
    }
  }

  async updateAccessToken(
    userId: string,
    env: 'sandbox' | 'production',
    contextUser: ITokenUser,
  ): Promise<IIntuitCredsResponse> {
    const creds = await this.IntuitCredsRepository.findOne({ userId, env });
    let {
      access_token,
      refresh_token,
      expires_in,
      x_refresh_token_expires_in,
    } = await refreshToken(creds?.refreshToken as string);

    if (creds && creds?.checkExpiaryStatus("refreshToken")) {
      let entity: Partial<IIntuitCredsRequest> = {
        accessToken: access_token,
        refreshToken: refresh_token,
        accessTokenExpiry: expires_in,
        realmId: creds.realmId,
        userId,
      };
      return await this.partialUpdate(contextUser.id, env, entity, contextUser);
    } else {
      await this.expireSession(contextUser.id, contextUser);
      throw new Error("Intuit Session Expired");
    }
  }

  async logout (userId: string, env: 'sandbox' | 'production'): Promise<void>{
    await this.IntuitCredsRepository.deleteRange({userId, env})
  }

  async deleteCreds(userId: string): Promise<void>{
    await this.IntuitCredsRepository.deleteRange({userId});
  } 
}
