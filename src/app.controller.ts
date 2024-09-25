import { Controller, Get } from '@nestjs/common';
import { MessagePattern, RpcException, Transport } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('get_user')
  getUser(data: any) {
    return this.appService.getUser(data.value)
      .then(res => res)
      .catch(err => err);
  }

  @MessagePattern('login')
  async login(data: any) {
    return await this.appService.signin(data.value)
      .then(res => res)
      .catch(err => err)
  }

  @MessagePattern('register')
  async register(data: any) {
    return await this.appService.register(data.value)
      .then(res => res)
      .catch(err => err);
  }

  @MessagePattern('forgot-password')
  async requestForgotPassword(data: any) {
    return await this.appService.forgotPasswordRequest(data.email)
      .then(res => res)
      .catch(err => err);
  }

  @MessagePattern('reset-password')
  async resetPassword(data: any) {
    return await this.appService.resetPassword(data.value.password, data.value.userId)
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

  @MessagePattern('authorize_user', Transport.KAFKA) // Listening for 'authorize_user' event
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
