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
    contextUser: ITokenUser,
  ): Promise<IIntuitCredsResponse> {
    let {
      access_token,
      refresh_token,
      expires_in,
      x_refresh_token_expires_in,
    } = await getTokenFromCallback(code);
    const creds = await this.IntuitCredsRepository.findOne({
      userId: contextUser.id,
    });

    if (creds)
      return await this.partialUpdate(
        contextUser.id,
        {
          accessToken: access_token,
          refreshToken: refresh_token,
          accessTokenExpiry: expires_in,
          refreshTokenExpiry: x_refresh_token_expires_in,
          realmId,
          userId: contextUser.id,
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
      return await this.updateAccessToken(userId, contextUser);
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

    partialEntity.accessTokenExpiry = undefined;
    partialEntity.refreshTokenExpiry = undefined;
    return await this.IntuitCredsRepository.findOneAndUpdate(
      { userId },
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

  async getFinancialOverview(contextUser: ITokenUser): Promise<unknown> {
    const { accessToken, realmId } = await this.getUpdatedToken(
      contextUser.id,
      contextUser,
    );
    return await getFinancialOverview(accessToken, realmId);
  }

  async getMonthlyTrends(
    contextUser: ITokenUser,
  ): Promise<Array<{ month: string; revenue: number; expenses: number }>> {
    const { accessToken, realmId } = await this.getUpdatedToken(
      contextUser.id,
      contextUser,
    );
    return await getMonthlyRevenueAndExpensesTrend(accessToken, realmId);
  }

  async getTopSourcesExpences(
    contextUser: ITokenUser,
  ): Promise<{ income: any; expenses: any }> {
    const { accessToken, realmId } = await this.getUpdatedToken(
      contextUser.id,
      contextUser,
    );
    const income = await getTopIncomeSources(accessToken, realmId);
    const expenses = await getTopExpenses(accessToken, realmId);
    return { income, expenses };
  }

  async getUpdatedToken(
    userId: string,
    contextUser: ITokenUser,
  ): Promise<{ accessToken: string; realmId: string }> {
    const creds = await this.IntuitCredsRepository.findOne({ userId });
    if (creds) {
      if (creds.checkExpiaryStatus("accessToken"))
        return {
          accessToken: creds.accessToken as string,
          realmId: creds.realmId,
        };
      const updatedCreds = await this.updateAccessToken(userId, contextUser);
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
    contextUser: ITokenUser,
  ): Promise<IIntuitCredsResponse> {
    const creds = await this.IntuitCredsRepository.findOne({ userId });
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
        refreshTokenExpiry: x_refresh_token_expires_in,
        realmId: creds.realmId,
        userId,
      };
      return await this.partialUpdate(contextUser.id, entity, contextUser);
    } else {
      await this.expireSession(contextUser.id, contextUser);
      throw new Error("Intuit Session Expired");
    }
  }
}
