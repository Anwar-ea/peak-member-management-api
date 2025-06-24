import { inject, injectable } from "tsyringe";
import { IMeasurableRepository, IPrivilegeRepository, IUserRepository } from "../dal";
import { IUserService } from "./abstractions";
import { IDataSourceResponse, IFetchRequest, IFilter, ILoginRequest, IUserRequest, IUserResponse, UserStatus } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { Measurable, User } from "../entities";
import { compareHash, decryptSSOToken, encrypt, signJwt } from "../utility";
import { FastifyError } from 'fastify'
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { IDropdownResponse } from "../models/inerfaces/response/dropdown-response";
import { IResetPassword } from "../models/inerfaces/request/resetPasswordRequest";
import { Goals, GoalUnits } from "../models/enums/goals.enum";
import crypto from 'crypto';

@injectable()
export class UserService implements IUserService {

    constructor(
        @inject('UserRepository') private readonly userRepository: IUserRepository, 
        @inject('PrivilegeRepository') private readonly privilegeRepository: IPrivilegeRepository,
        @inject('MeasurableRepository') private readonly measureableRepoisitory: IMeasurableRepository,
    
    ) { }
    
    private readonly sites = [
            "https://members.aaepa.com", 
            "https://elearning.aaepa.com", 
            "https://shop.aaepa.com", 
            "https://help.aaepa.com", 
            "https://mb.aaepa.com"
    ];

    private readonly secretKey = 'jf8gf8g^3*s';
    private readonly secretIv = 'd&&9"dh4%:@';

    /**
     * Generates login token and URLs for WordPress SSO
     */
    public async generateLoginToken(user: any, finalRedirectUrl: string): Promise<{
        token: string;
        firstLoginUrl: string;
    }> {
        if (!user?.email) throw new Error('Invalid user object');

        const userData = {
            firstname: user.firstName || '',
            lastname: user.lastName || '',
            user_email: user.email,
            user_login: user.userName || '',
            display_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
            action: "login",
            user_pass: '',
            redirect_to: '', // only needed in final
            final_redirect: '',
            status: user.status ? 0 : 1
        };

        const token = await this.encryptSSOToken(userData);

        // Build redirect chain dynamically (Site A -> Site B -> Site C -> App)
        const chain = this.sites.reduceRight((nextRedirect, site) => {
            const url = `${site}/sso-ep/?sso_token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(nextRedirect)}`;
            return url;
        }, finalRedirectUrl); // final redirect is the last stop

        const firstLoginUrl = chain; // full redirect chain begins here

        return { token, firstLoginUrl };
    }

    /**
     * Encrypts SSO token using same method as WordPress plugin
     */
    private async encryptSSOToken(data: Record<string, string | number>): Promise<string> {
        // Generate key and IV exactly like PHP
        const key : any = crypto.createHash('sha256').update(this.secretKey).digest();
        const iv : any= crypto.createHash('sha256').update(this.secretIv).digest().subarray(0, 16);

        // Convert data to EXACTLY what WordPress expects
        // 1. First convert your data to a query string
        const dataString = Object.entries(data)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v.toString())}`)
            .join('&');
        
        // 2. Then wrap it in the 'key' parameter that WordPress expects
        const wrappedData = { key: dataString };
        const plaintext = new URLSearchParams(wrappedData).toString();

        // Apply PKCS7 padding manually
        const blockSize = 16;
        const padLength = blockSize - (plaintext.length % blockSize);
        const padding = String.fromCharCode(padLength).repeat(padLength);
        const paddedPlaintext = plaintext + padding;

        // Encrypt with same options
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        cipher.setAutoPadding(false);

        let encrypted : any = cipher.update(paddedPlaintext, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // URL-safe base64 (matches PHP's strtr)
        return encrypted.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    async login(loginRequest: ILoginRequest): Promise<IUserResponse & {token: string}> {
        const user = await this.userRepository.findOne({
            $or: [
                { userName: loginRequest.userName },
                { email: loginRequest.userName }
            ],
            active: true
        });
    
        const error: FastifyError = {
            code: '401',
            message: 'Invalid username or password',
            name: 'Unauthorized'
        };
    
        if (!user) throw new Error('Invalid username or password');
    
        const match = await compareHash(loginRequest.password, user.passwordHash);
    
        if (!match) throw new Error('Invalid username or password');
    
        user.lastLogin = new Date();
        await this.userRepository.update(user._id.toString(), user);
    
        const privileges = await this.privilegeRepository.find({
            _id: { $in: user.role?.privilegeIds ?? [] }
        });
    
        if (user.role) user.role.privileges = privileges;
    
        const payload = {
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            accountId: user.accountId.toString(),
            lawFirmId: user.lawFirmId ? user.lawFirmId.toString() : undefined,
            privileges: user.role?.privileges?.map(x => x.code) ?? []
        };
    
        const tokenExpiry = loginRequest.rememberMe ? '7d' : '3h';
    
        const token = signJwt(payload, null, tokenExpiry);
        const redirectUrl = 'https://memberaccountability.com/dashboard'; // Set your desired redirect URL after login
        const { firstLoginUrl } = await this.generateLoginToken(user, redirectUrl);
        
        // Add WordPress login URLs to the response
        user.wordpressLoginUrls = firstLoginUrl;
        return {
            ...user.toResponse(user),
            token
        };
    }
    
    async loginBySSO(sso_token: string): Promise<IUserResponse & {token: string} | undefined> {
        if (!sso_token) {
        throw new Error('SSO token is required.')
        }

        const userData = await decryptSSOToken(sso_token);

        if (!userData) {
            return;
        }
        const user = await this.userRepository.findOne({
            email: userData.email,
            active: true
        });
    
    
        if (!user){
            return;
        };
    
        user.lastLogin = new Date();
        await this.userRepository.update(user._id.toString(), user);
    
        const privileges = await this.privilegeRepository.find({
            _id: { $in: user.role?.privilegeIds ?? [] }
        });
    
        if (user.role) user.role.privileges = privileges;
    
        const payload = {
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            accountId: user.accountId.toString(),
            lawFirmId: user.lawFirmId ? user.lawFirmId.toString() : undefined,
            privileges: user.role?.privileges?.map(x => x.code) ?? []
        };
    
        const tokenExpiry = '3h';
    
        const token = signJwt(payload, null, tokenExpiry);
    
        return {
            ...user.toResponse(user),
            token
        };
    }

    async loginAsMember(memberId: string): Promise<IUserResponse & {token: string}> {
        let user = await this.userRepository.findOneById(memberId) as User;

            user.lastLogin = new Date();
            await this.userRepository.update(user._id.toString(),user);
            let privilages = await this.privilegeRepository.find({_id: {$in: user.role?.privilegeIds ?? []}});
            if(user.role ) user.role.privileges = privilages;
            return {...user.toResponse(user), token: signJwt({id: user._id.toString(), name: `${user.firstName} ${user.lastName}`, lawFirmId: user.lawFirmId ? user.lawFirmId.toString() : undefined, accountId: user.accountId.toString(), privileges: user.role?.privileges ? user.role.privileges.map(x => x.code) : []})};

    }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<User, keyof User>>): Promise<IUserResponse | null> {
        return await this.userRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IUserRequest, contextUser?: ITokenUser): Promise<IUserResponse> {
        let user = new User().toEntity(entityRequest, undefined, contextUser);

        let revenueMeasurable = new Measurable().toEntity({
            name: 'Revenue',
            unit: GoalUnits.Revenue,
            goal: Goals.GreaterThanOrEqualTo,
            goalMetric: 10000,
            showAverage: true,
            showCumulative: true,
            applyFormula: false,
            formula: undefined,
            accountableId: user._id.toString()
        }, 
        undefined, 
        {id: user._id.toString(), name: `${user.firstName} ${user.lastName}`, accountId: user.accountId.toString(), privileges: []});

        let retentionMeasurable = new Measurable().toEntity({
            name: 'Retention',
            unit: GoalUnits.RetentionRate,
            goal: Goals.GreaterThanOrEqualTo,
            goalMetric: 60,
            showAverage: true,
            showCumulative: true,
            applyFormula: false,
            formula: undefined,
            accountableId: user._id.toString()
        }, 
        undefined, 
        {id: user._id.toString(), name: `${user.firstName} ${user.lastName}`, accountId: user.accountId.toString(), privileges: []})

        await this.measureableRepoisitory.add(revenueMeasurable)
        await this.measureableRepoisitory.add(retentionMeasurable);
        user.passwordHash = await encrypt(entityRequest.password);
        user.status = UserStatus.Online;
        let response  = await this.userRepository.add(user);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IUserRequest[], contextUser: ITokenUser): Promise<IUserResponse[]> {
        return (await this.userRepository.addRange(entitesRequest.map<User>(acc => {
            let user = new User().toEntity(acc, undefined, contextUser);
            return user;
        }))).map(u => u.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<User>): Promise<IDataSourceResponse<IUserResponse>> {
        return await this.userRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IUserResponse | null> {
        return await this.userRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IUserRequest, contextUser: ITokenUser): Promise<IUserResponse> {
        let user = new User().toEntity(entityRequest, id, contextUser);
        return await this.userRepository.update(id, user);
    }

    async partialUpdate(id: string, entityRequest: Partial<IUserRequest>, contextUser: ITokenUser): Promise<IUserResponse> {
        let entity: Partial<User> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id),
        };

        return await this.userRepository.update(id, assignIn(entity, entityRequest));
    }

    async resetPassword(resetPassword: IResetPassword, contextUser: ITokenUser): Promise<IUserResponse> {
        let entity: Partial<User> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id),
            passwordHash: await encrypt(resetPassword.password)
        };
        let updatedEntity = this.userRepository.update(resetPassword.userId, entity);
        return updatedEntity;
    }

    async updateMany(entitesRequest: (IUserRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return this.userRepository.updateRange(entitesRequest.map<User>(acc => {
            let user = new User().toEntity(acc, acc.id, contextUser);
            return user;
        }), {})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.userRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let users = await this.userRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(users.length !== ids.length) throw new Error(`Some user with provided ids not found`);

    }

    async dropdown(accountId: string): Promise<IDropdownResponse[]> {
        return await this.userRepository.dropdown(accountId, ['firstName', 'lastName']);
    }
}