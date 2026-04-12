import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class ProfileOnboardingNotCompletedException extends ForbiddenException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(ProfileOnboardingNotCompletedException.name);
    logger.error(ProfileOnboardingNotCompletedException.name, {
      transactionId,
      ...args,
    });
  }
}

export class ProfileEmailNotVerifiedException extends ForbiddenException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(ProfileEmailNotVerifiedException.name);
    logger.error(ProfileEmailNotVerifiedException.name, {
      transactionId,
      ...args,
    });
  }
}

export class WaitlistPendingException extends ForbiddenException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(WaitlistPendingException.name);
    logger.info(WaitlistPendingException.name, {
      transactionId,
      ...args,
    });
  }
}

export class ProfileAlreadyExistException extends ConflictException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(ProfileAlreadyExistException.name);
    logger.error(ProfileAlreadyExistException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new ProfileAlreadyExistException(logger, transactionId, error);
  }
}

export class ProfileCreateInternalException extends ConflictException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(ProfileCreateInternalException.name);
    logger.error(ProfileCreateInternalException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new ProfileCreateInternalException(logger, transactionId, error);
  }
}

export class ProfileUpdateException extends InternalServerErrorException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(ProfileUpdateException.name);
    logger.error(ProfileUpdateException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new ProfileUpdateException(logger, transactionId, error);
  }
}

export class AchievementCreateException extends InternalServerErrorException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(AchievementCreateException.name);
    logger.error(AchievementCreateException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new AchievementCreateException(logger, transactionId, error);
  }
}

export class AchievementUpdateException extends InternalServerErrorException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(AchievementUpdateException.name);
    logger.error(AchievementUpdateException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new AchievementUpdateException(logger, transactionId, error);
  }
}

export class AchievementDeleteException extends InternalServerErrorException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(AchievementDeleteException.name);
    logger.error(AchievementDeleteException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new AchievementDeleteException(logger, transactionId, error);
  }
}
