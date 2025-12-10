import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseOptions } from '@app/core';
import { RequestIdMiddleware } from '@app/core/middleware/requestId.middleware';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseOptions,
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UserModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
