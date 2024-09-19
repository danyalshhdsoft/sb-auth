import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/schema/user.schema';

@Injectable()
export class EmailService {
    constructor(private mailerService: MailerService) {}

  async sendUserWelcome(user: User, otp: string) {
    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Softbuilders Properties! Confirm your Email',
      template: './welcome',
      context: {
        name: user.firstName,
        otp,
      },
    });
  }

  async resetPasswordEmail(user: User, link: string) {
    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Password Reset Request',
      template: './reset-password',
      context: {
        name: user.firstName,
        link,
      },
    });
  }

  async forgotPasswordEmail(firstName,email: string, link: string) {
    await this.mailerService.sendMail({
      to: email,
      
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Password Forgot Request',
      template: './reset-password',
      context: {
        name:firstName,
        headerTitle:"Forgot Your Password",
        headerMessage :"Click on the given link to reset your password and regain access to your account.",
        link,
      },
    });
  }
}
