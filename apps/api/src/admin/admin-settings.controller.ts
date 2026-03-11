import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminSettingsService } from './admin-settings.service';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get('plans')
  async getPlans() {
    return this.settingsService.getPlans();
  }

  @Patch('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() data: any) {
    return this.settingsService.updatePlan(id, data);
  }

  @Get('configs')
  async getConfigs() {
    return this.settingsService.getConfigs();
  }

  @Post('configs')
  async updateConfig(
    @Body() body: { key: string; value: string; description?: string },
  ) {
    return this.settingsService.updateConfig(
      body.key,
      body.value,
      body.description,
    );
  }

  @Get('promo-codes')
  async listCoupons() {
    return this.settingsService.listCoupons();
  }

  @Post('promo-codes')
  async createCoupon(@Body() data: any) {
    return this.settingsService.createCoupon(data);
  }

  @Post('seed')
  async seed() {
    await this.settingsService.seedInitialData();
    return { message: 'Initial data seeded' };
  }
}
