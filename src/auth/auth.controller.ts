import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { GoogleSignInDto, LoginDto } from './dto/login-dto';
import { ForgotPasswordDto } from './dto/forgot-password';
import compileEmailTemplate from 'src/common/services/compile-email.service';
import {
  QUEUE_JOB_STATUS,
  QUEUE_JOB_TYPE,
} from 'src/queue-jobs/queue-jobs.constants';
import { QueueJobsService } from 'src/queue-jobs/queue-jobs.service';
import { GoogleAuthService } from './google-auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly queueJobService: QueueJobsService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}
  @Post('sign-up')
  async SignUp(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const user = await this.userService.create(createUserDto);
    if (!user) {
      throw new BadRequestException('User not created');
    }
    // const customerId = await this.stripeService.getOrCreateCustomer(user.data._id);
    // update created user stripeCustomerId
    // await this.userService.findByIdAndUpdate(user.data._id, {
    //   stripeCustomerId: customerId,
    // });
    // create user wallet
    // await this.walletService.create({ user: user.data._id });
    return user;
  }

  @Post('login')
  async Login(@Body() loginDto: LoginDto) {
    const user = await this.userService.findOne({ email: loginDto.email });
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    if (
      !(await this.authService.comparePassword(
        loginDto.password,
        user.password,
      ))
    ) {
      throw new UnauthorizedException('Incorrect Credentials');
    }
    const token = await this.authService.createToken(user);
    return { message: 'Login Successfull', token };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    // find user
    const user = await this.userService.findOne({ email: body.email });
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    const otp = await this.authService.generateOtp();

    this.userService.findByIdAndUpdate(user._id, {
      passwordResetToken: otp,
      passwordResetTokenExpiresAt: Date.now() + 30 * 60 * 1000,
    });
    const code = otp.toString();
    const template = await compileEmailTemplate({
      fileName: 'forgot-password.mjml',
      data: { name: user.name, email: user.email, code },
    });

    await this.queueJobService.create({
      type: QUEUE_JOB_TYPE.EMAIL,
      maxRetries: 5,
      attempts: 0,
      status: QUEUE_JOB_STATUS.PENDING,
      data: {
        template: template,
        name: user.name,
        email: user.email,
        code: code,
        subject: 'Reset Your Password',
      },
    });
    return { message: 'OTP send to your email' };
  }

  @Post('/google/sign-in')
  async googleSignUp(@Body() googleSignInDto: GoogleSignInDto) {
    const { code } = googleSignInDto;
    try {
      const googleToken = await this.googleAuthService.getTokens(code);
      const { userId: googleUserId, payload } =
        await this.googleAuthService.verify(googleToken.id_token);
      let user = await this.userService.findOne({
        $or: [{ email: payload.email }, { googleSignInId: googleUserId }],
      });
      if (!user) {
        user = {
          googleSignInId: googleUserId,
          name: payload.name,
          email: payload.email,
          profilePicture: payload.picture,
          googleSignInEnabled: true,
          emailVerified: true,
        };
        user = await this.userService.create(user);
      } else {
        const updateFields: Partial<typeof user> = {};
        if (user.googleSignInId !== googleUserId) {
          updateFields.googleSignInId = googleUserId;
        }
        user = await this.userService.findByIdAndUpdate(user._id, updateFields);
      }
      const token = this.authService.signToken(user.data._id);
      return {
        status: 'success',
        data: {
          token,
          loginType: 'GOOGLE',
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error while verifying Google Auth Token', error);
      throw new InternalServerErrorException(
        'An error occurred during Google authentication',
        error.message,
      );
    }
  }
}
