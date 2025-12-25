import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signinSchema, signupSchema, SigninInput, SignupInput } from '@yuan-shan/keydo-contract';
import { Public } from '../common/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @Public()
  @UsePipes(new ZodValidationPipe(signinSchema))
  async signin(@Body() signinDto: SigninInput) {
    return this.authService.signin(signinDto);
  }

  @Post('signup')
  @Public()
  @UsePipes(new ZodValidationPipe(signupSchema))
  async signup(@Body() signupDto: SignupInput) {
    return this.authService.signup(signupDto);
  }
}

