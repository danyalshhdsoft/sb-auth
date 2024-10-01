import { Controller, Get } from '@nestjs/common';
import { MessagePattern, RpcException, Transport } from '@nestjs/microservices';
import { AppService } from './app.service';
import { EVENT_TOPICS } from './enums/event-topics.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern(EVENT_TOPICS.GET_USER_DETAILS)
  getUser(data: any) {
    return this.appService.getUser(data.value)
      .then(res => res)
      .catch(err => err);
  }

  @MessagePattern(EVENT_TOPICS.LOGIN)
  async login(data: any) {
    return await this.appService.signin(data.value)
      .then(res => res)
      .catch(err => err)
  }

  @MessagePattern(EVENT_TOPICS.REGISTER)
  async register(data: any) {
    return await this.appService.register(data.value)
      .then(res => res)
      .catch(err => err);
  }

  @MessagePattern(EVENT_TOPICS.FORGOT_PASSWORD)
  async requestForgotPassword(data: any) {
    return await this.appService.forgotPasswordRequest(data.email)
      .then(res => res)
      .catch(err => err);
  }

  @MessagePattern(EVENT_TOPICS.RESET_PASSWORD)
  async resetPassword(data: any) {
    return await this.appService.resetPassword(data.value.password, data.value.userId)
      .then(res => res)
      .catch(err => err);
  }

  @MessagePattern(EVENT_TOPICS.ONBOARDING_VERIFY)
  async onboardingVerify(data: any) {
    return await this.appService.onboardingVerify(data.value.password, data.value.userId)
      .then(res => res)
      .catch(err => err);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('reset-password')
  // async ressetPassword(
  //   @Body() resetPasswordDto: ResetPasswordDto,
  //   @Req() req: any,
  // ) {
  //   return await this.appService.resetPassword(
  //     resetPasswordDto.password,
  //     req.user.id,
  //   );
  // }

  @MessagePattern(EVENT_TOPICS.AUTHORIZE_USER, Transport.KAFKA) // Listening for 'authorize_user' event
  async authorizeUser(data: any) {
    try {
      console.log('Authorization Service pinging....');
      const isValid = await this.appService.validateUser(data.value.sub);
      return isValid;
    } catch (oError) {
      console.error('Error while authorizing user:', oError);
      throw new RpcException(oError);
    }
  }
}
