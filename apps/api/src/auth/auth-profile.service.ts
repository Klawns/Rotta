import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ProfileCacheService } from '../cache/profile-cache.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import type { SubscriptionAccessSnapshot } from '../subscriptions/subscriptions.service';
import { UsersService } from '../users/users.service';
import type { User } from '../users/interfaces/users-repository.interface';
import type { UserResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly profileCacheService: ProfileCacheService,
  ) {}

  private buildUserProfile(
    user: User,
    access: SubscriptionAccessSnapshot,
  ): UserResponseDto {
    const { subscription, status: accessStatus } = access;
    const normalizedSubscription = subscription
      ? {
          plan: subscription.plan,
          status:
            accessStatus === 'active'
              ? subscription.status
              : accessStatus === 'missing'
                ? 'inactive'
                : accessStatus,
          trialStartedAt: subscription.trialStartedAt ?? null,
          trialEndsAt: access.trialEndsAt,
          trialDaysRemaining: access.trialDaysRemaining,
          isTrialExpiringSoon: access.isTrialExpiringSoon,
          validUntil: subscription.validUntil ?? null,
          rideCount: subscription.rideCount,
        }
      : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      taxId: user.taxId ?? null,
      cellphone: user.cellphone ?? null,
      hasSeenTutorial: Boolean(user.hasSeenTutorial),
      subscription: normalizedSubscription,
      createdAt: user.createdAt,
    };
  }

  async getLatestProfile(userId: string): Promise<UserResponseDto | null> {
    const cachedProfile =
      await this.profileCacheService.get<UserResponseDto>(userId);

    if (cachedProfile) {
      return cachedProfile;
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      return null;
    }

    const access = await this.subscriptionsService.getAccessSnapshot(userId);
    const profile = this.buildUserProfile(user, access);

    await this.profileCacheService.set(userId, profile);

    return profile;
  }

  async getRequiredProfile(userId: string): Promise<UserResponseDto> {
    const profile = await this.getLatestProfile(userId);

    if (!profile) {
      throw new UnauthorizedException('Usuario nao encontrado.');
    }

    return profile;
  }

  async invalidateProfile(userId: string) {
    await this.profileCacheService.invalidate(userId);
  }
}
