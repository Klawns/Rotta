import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { AuthService } from '../auth/auth.service';

@Controller('settings')
@UseGuards(AuthGuard('jwt'))
export class SettingsController {
  constructor(
    private settingsService: SettingsService,
    private authService: AuthService,
  ) {}

  @Patch('tutorial-seen')
  async tutorialSeen(@Request() req: any) {
    return this.authService.tutorialSeen(req.user.id);
  }

  @Get('ride-presets')
  async getRidePresets(@Request() req: any) {
    return this.settingsService.getRidePresets(req.user.id);
  }

  @Post('ride-presets')
  async createRidePreset(
    @Request() req: any,
    @Body() body: { label: string; value: number; location: string },
  ) {
    return this.settingsService.createRidePreset(req.user.id, body);
  }

  @Patch('ride-presets/:id')
  async updateRidePreset(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: Partial<{ label: string; value: number; location: string }>,
  ) {
    return this.settingsService.updateRidePreset(req.user.id, id, body);
  }

  @Delete('ride-presets/:id')
  async deleteRidePreset(@Request() req: any, @Param('id') id: string) {
    return this.settingsService.deleteRidePreset(req.user.id, id);
  }
}
