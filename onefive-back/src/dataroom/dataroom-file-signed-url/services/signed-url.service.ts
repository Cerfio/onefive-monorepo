import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogService } from 'logstash-winston-3';
import { StorageService } from '../../../storage/storage.service';
import { SignedUrlGetException } from '../exceptions/signed-url.exception';

@Injectable()
export class SignedUrlService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async get({
    transactionId,
    storageId,
    expiresIn = 60,
  }: {
    transactionId: string;
    storageId: string;
    expiresIn?: number;
  }): Promise<{ url: string }> {
    try {
      const bucket =
        this.configService.get<string>('R2_BUCKET_NAME') || 'onefive-storage';

      return await this.storageService.signUrlByKey({
        transactionId,
        bucket,
        key: storageId,
        expiresIn,
      });
    } catch (error) {
      SignedUrlGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
