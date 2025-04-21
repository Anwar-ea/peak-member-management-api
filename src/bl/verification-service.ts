import { VerificationRepository, UserRepository } from '../dal';
import { Verification } from "../entities";
import { randomUUID } from 'crypto';
import moment from 'moment';
import { sendEmail, signVerificationJwt } from '../utility';
import { signJwt, verifyJwt } from '../utility';
import { templateReader } from '../utility';
import { injectable } from 'tsyringe';
import { Types } from 'mongoose';

@injectable()
export class VerificationService {

    constructor(private readonly verificationRepository: VerificationRepository, private readonly userRepository: UserRepository) {

    }

    async addVerification(email: string, type: 'url' | 'otp'): Promise<any> {
        let currentTimeStamp = new Date();
        this.userRepository.populate = ['role'];
        let user = await this.userRepository.findOne({$or: [{email: email}, {userName: email}]});
        let newVerification: Verification | null = null;
        
        if(!user) {
            throw new Error('User not found');
        }

        if(user){
            newVerification = new Verification;
            newVerification._id = new Types.ObjectId();
            newVerification.createdAt = new Date();
            newVerification.createdById = user._id;
            newVerification.createdBy = `${user.firstName} ${user.lastName}`;
            newVerification.accountId = user.accountId;
            newVerification.active = true;
            newVerification.deleted = false;
            newVerification.userId = user._id;
            newVerification.expireTime = moment(currentTimeStamp).add(5, 'minute').toDate();
            newVerification.status = 'Pending';
            newVerification.type = 'ResetPassword';
            newVerification.userId = user._id;
            newVerification.email = user?.email;
            newVerification.jwt = await signVerificationJwt({id: user._id, email: user?.email, roles: user.role, userName: `${user.firstName} ${user.lastName}`}, process.env.VERIFICATION_TOKEN_SECRET, '5 minute'),
            newVerification.OTP= this.generateOTP();
            newVerification.name= `${user.firstName} ${user.lastName}`;
        }

        let result: Verification | undefined = undefined;
        
        if(newVerification){
             result = await this.verificationRepository.add(newVerification);
        }
            
        if(result) {
            let template = templateReader('reset-password.html');
           await  sendEmail('',result.email, 'Reset Password Request', template, {userName: result.name, resetPasswordUrl: `https://memberaccountability.com/auth/reset-password/${result.jwt}`})
        } 

        if(result) this.updateVerification(result._id.toString(), {status: 'Delivered'});


        return {};
    }

    async getVerifications(): Promise<Array<Verification>> {
        return (await this.verificationRepository.find());
    }

    async getVerificationByUserId(id: string): Promise<any> {
        let verification = await this.verificationRepository.findOne({userId: id});
        return verification ;
    }

    async updateVerification(id: string, verification: Verification | Partial<Verification>): Promise<any> {
        let result = await this.verificationRepository.update(id, verification);
        return result;
    }

    async deleteVerification(id: string): Promise<void> {
        await this.verificationRepository.delete(id);
        return;
    }

    async verify(jwt: string): Promise<{verified: boolean, error?: string | null}> {
        let verification = await this.verificationRepository.findOne({jwt: jwt});
        
        if(verification && verification.status == 'Delivered'){
            let verified = false;

            try{

                verified =  verifyJwt(verification.jwt as string, process.env.VERIFICATION_TOKEN_SECRET, false);
            }catch(err){

                await this.updateVerification(verification._id.toString(), {status: 'Expired'});
            }

            return {verified, error: verified ? null : 'Your verification url has been expired.'}
        }

        return {verified: false, error: 'Your verification url has been expired.'};
    }

    private generateOTP(): string {
        let OTP = '';
      
        for (let i = 0; i < 6; i++) {
          const randomNumber = Math.floor(Math.random() * 10);
          OTP += randomNumber.toString();
        }
      
        return OTP;
    }


}