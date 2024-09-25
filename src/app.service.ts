import {
  BadRequestException,
  Inject,
  // BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GetUserRequest } from './get-user-request.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Model, Schema } from 'mongoose';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDto } from './dto/auth.dto';
// import { OTP_TOKEN_TYPES } from './schema/otp-tokens.schema';
import { OtpTokensService } from './otp-tokens/otp-tokens.service';
//import { EmailService } from './email/email.service';
import { AuthJwtService } from './auth/jwt/jwt.service';
import { OTP_TOKEN_TYPES } from './schema/otp-tokens.schema';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email/email.service';
@Injectable()
export class AppService {
  constructor(
    private jwtService: JwtService,
    private readonly authJwtService: AuthJwtService,
    private emailService: EmailService,
    private verificationCodeService: OtpTokensService,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(ConfigService) private config: ConfigService,
  ) { }

  private readonly users: any[] = [
    {
      userId: '123',
      stripeUserId: '43234',
    },
    {
      userId: '345',
      stripeUserId: '27279',
    },
  ];

  getHello(): string {
    return 'Hello World!';
  }

  getUser(getUserRequest: GetUserRequest) {
    return this.users.find((user) => user.userId === getUserRequest.userId);
  }

  async signin(user: any) {
    try {
      if (!user) {
        return {
          status: 500,
          data: 'UnAuthenticated',
        };
      }
      
      const userExists = await this.findUserByEmail(user.email);

      if (!userExists) {
        return await {
          status: 500,
          data: {
            message: 'Please register before login'
          },
        };
      }

      if (!(await bcrypt.compare(user.password, userExists?.password))) {
        return {
          status: 400,
          data: {
            message: "Incorrect Password"
          },
        };
      }

      const token = this.generateJwt({
        sub: userExists.id,
        email: userExists.email,
      });
      
      return {
        status: 200,
        data: {
          data: {
            token,
            user: this.getUserBasicData(userExists)
          }
        },
      };
    }
    catch (err) {
      throw new BadRequestException(err);
    }
  }

  async register(user: RegisterUserDto) {
    const hashPass = await this.hashPassword(user.password);
    const newUser = await this.userModel.create({
      ...user,
      password: hashPass,
    });

    const otp = await this.verificationCodeService.createVerificationCode(
      newUser,
      OTP_TOKEN_TYPES.EMAIL_VERIFICATION,
    );

    this.emailService.sendUserWelcome(newUser, otp.code);

    const token = this.generateJwt({
      sub: newUser.id,
      email: newUser.email,
    });

    return {
      status: 201,
      data: {
        token,
        user: this.getUserBasicData(newUser),
      },
    };
  }

  async forgotPasswordRequest(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('No user exists with this email');

    const token = this.generateJwt({
      sub: user._id,
      email: user.email,
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL');
    const link = `${frontendUrl}/reset-password?token=${token}`;

    this.emailService.resetPasswordEmail(user, link);
    return 'Reset Password Email Sent';
  }

  async resetPassword(password: string, userId: Schema.Types.ObjectId) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    const hashPass = await this.hashPassword(password);
    user.password = hashPass;
    await user.save();

    return {
      status: 200,
      data: {
        message: "Password reset Succesfully"
      }
    };
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  generateJwt(payload) {
    return this.jwtService.sign(payload, {
      expiresIn: '24h',
    });
  }

  async findUserByEmail(email) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return null;
    }

    return user;
  }

  getUserBasicData(user: User) {
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboardingStep: this.getUserOnboardingStep(user),
    };
  }

  getUserOnboardingStep(user: User) {
    if (!user.emailVerified) return 'email-verification';
    return 'dashboard';
  }

  async validateUser(token: string) {
    try {
      const verifiedToken = await this.authJwtService.validateToken(token);

      if (!verifiedToken) {
        throw new UnauthorizedException('User Authentication Failed');
      }
      return true;
    } catch (e) {
      throw [
        {
          status: 401,
          message: e,
        },
      ];
    }
  }
}
