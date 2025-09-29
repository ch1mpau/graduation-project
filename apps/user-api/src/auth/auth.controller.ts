import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TransformResponseInterceptor } from '@app/core/interceptors/transform-response.interceptor';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/response-login.dto';
import { SignUpDto } from './dto/signup.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
@UseInterceptors(TransformResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async create(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signUpDto: SignUpDto): Promise<any> {
    return await this.authService.signup(signUpDto);
  }
}
