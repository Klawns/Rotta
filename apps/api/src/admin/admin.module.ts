import { Module, OnModuleInit } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettingsController } from './admin-settings.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [PaymentsModule],
    providers: [AdminService, AdminSettingsService],
    controllers: [AdminController, AdminSettingsController],
    exports: [AdminSettingsService],
})
export class AdminModule implements OnModuleInit {
    constructor(private readonly settingsService: AdminSettingsService) { }

    async onModuleInit() {
        await this.settingsService.seedInitialData();
    }
}
