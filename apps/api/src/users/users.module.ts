import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DrizzleUsersRepository } from './repositories/drizzle-users.repository';
import { IUsersRepository } from './interfaces/users-repository.interface';

@Module({
  providers: [
    UsersService,
    {
      provide: IUsersRepository,
      useClass: DrizzleUsersRepository,
    },
  ],
  exports: [UsersService, IUsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
