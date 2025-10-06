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
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AppleSignInDto, GoogleSignInDto, LoginDto } from './dto/login-dto';
import { ForgotPasswordDto } from './dto/forgot-password';
import compileEmailTemplate from 'src/common/services/compile-email.service';
import {
  QUEUE_JOB_STATUS,
  QUEUE_JOB_TYPE,
} from 'src/queue-jobs/queue-jobs.constants';
import { QueueJobsService } from 'src/queue-jobs/queue-jobs.service';
import { GoogleAuthService } from './google-auth.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtGuards } from 'src/common/guards/jwt-guards';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AppleAuthService } from './apple-auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly queueJobService: QueueJobsService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly appleAuthService: AppleAuthService,
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

    await this.userService.findByIdAndUpdate(user._id, {
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
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const user = await this.userService.findOne({
      email: resetPasswordDto.email,
      passwordResetToken: resetPasswordDto.otp,
    });

    if (!user) {
      throw new BadRequestException("User with this email doesn't exist");
    }

    if (Date.now() > user.passwordResetTokenExpiresAt) {
      throw new BadRequestException('OTP Expired');
    }

    await this.userService.findByIdAndUpdate(user._id, {
      password: resetPasswordDto.newPassword,
    });
    return { message: 'Password Reset Successful' };
  }
  @UseGuards(JwtGuards)
  @Post('change-password')
  async changePasword(
    @Request() request,
    @Body() changePaswordDto: ChangePasswordDto,
  ) {
    if (
      !(await this.authService.comparePassword(
        changePaswordDto.oldPassword,
        request.user.password,
      ))
    ) {
      throw new UnauthorizedException('Incorrect Old Password');
    }
    await this.userService.findByIdAndUpdate(request.user._id, {
      password: changePaswordDto.newPassword,
    });

    return { message: 'Password changed successfully' };
  }

  @Post('/google/sign-in')
  async googleSignIn(@Body() googleSignInDto: GoogleSignInDto) {
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

  @Post('/apple/sign-in')
  async appleSignIn(@Body() appleSignInDto: AppleSignInDto) {
    const { code } = appleSignInDto;
    try {
      const appleTokens = await this.appleAuthService.getTokens(code);
      const { userId: appleUserId, payload } =
        await this.appleAuthService.verify(appleTokens.id_token);

      let user = await this.userService.findOne({
        $or: [{ email: payload.email }, { appleSignInId: appleUserId }],
      });

      if (!user) {
        // Create new user (name may be missing after first login)
        const fullName = payload.name
          ? `${payload.name.firstName || ''} ${payload.name.lastName || ''}`.trim()
          : 'Apple User';
        user = {
          appleSignInId: appleUserId,
          name: fullName,
          email: payload.email,
          profilePicture: '', // Apple doesn't provide one
          appleSignInEnabled: true,
          emailVerified: payload.email_verified,
        };
        user = await this.userService.create(user);
      } else {
        // Update if needed (e.g., link appleSignInId if not set)
        const updateFields: Partial<typeof user> = {};
        if (user.appleSignInId !== appleUserId) {
          updateFields.appleSignInId = appleUserId;
        }
        user = await this.userService.findByIdAndUpdate(user._id, updateFields);
      }

      const token = this.authService.signToken(user.data._id); // Assuming signToken exists in AuthService
      return {
        status: 'success',
        data: {
          token,
          loginType: 'APPLE',
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error while verifying Apple Auth Token', error);
      throw new InternalServerErrorException(
        'An error occurred during Apple authentication',
        error.message,
      );
    }
  }
}
