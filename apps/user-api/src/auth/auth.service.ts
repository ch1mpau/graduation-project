import {
  AppBadRequestException,
  AppUnAuthorizedException,
  ErrorCode,
  resolveErrorMessage,
  Role,
} from '@app/core';
import { StatusAccount } from '@app/core/constants/status-account';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/core/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/response-login.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersRepository.findOne({
      where: {
        email: loginDto.email,
        status: StatusAccount.ACTIVE,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new AppUnAuthorizedException(ErrorCode.ACCOUNT_NOT_FOUND);
    }
    const { password, ...payload } = user;

    if (loginDto.password !== password) {
      throw new AppUnAuthorizedException(ErrorCode.WRONG_PASSWORD);
    }
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async signup(signUpDto: SignUpDto): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          email: signUpDto.email,
          deleted_at: null,
        },
      });
      if (!!user && user?.status !== StatusAccount.ACTIVE) {
        throw new AppBadRequestException(ErrorCode.ACCOUNT_BANNED);
      }
      if (!!user) {
        throw new AppUnAuthorizedException(ErrorCode.EMAIL_IS_EXIST);
      }
      if (signUpDto.password !== signUpDto.rePassword) {
        throw new AppUnAuthorizedException(ErrorCode.WRONG_RE_PASSWORD);
      }
      await this.usersRepository.save(
        this.usersRepository.create({
          email: signUpDto.email,
          password: signUpDto.password,
          status: StatusAccount.ACTIVE,
          role: Role.Employee,
        }),
      );
      return;
    } catch (error) {
      throw error;
    }
  }
}
