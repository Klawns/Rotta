import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { DrizzleClientsRepository } from './repositories/drizzle-clients.repository';
import { IClientsRepository } from './interfaces/clients-repository.interface';

@Module({
  providers: [
    ClientsService,
    {
      provide: IClientsRepository,
      useClass: DrizzleClientsRepository,
    },
  ],
  controllers: [ClientsController],
  exports: [ClientsService, IClientsRepository],
})
export class ClientsModule {}
