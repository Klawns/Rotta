import {
  Controller,
  Get,
  UseGuards,
  Query,
  Delete,
  Param,
  Put,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users/recent')
  async getRecentUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.adminService.getRecentUsers(Number(page), Number(limit));
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @HttpCode(HttpStatus.OK)
  @Put('users/:id/plan')
  async updateUserPlan(
    @Param('id') id: string,
    @Body('plan') plan: 'starter' | 'premium' | 'lifetime'
  ) {
    return this.adminService.updateUserPlan(id, plan);
  }
}
