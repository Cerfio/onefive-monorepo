import { Test, TestingModule } from '@nestjs/testing';
import { SignedUrlService } from './signed-url.service';
import { LogService } from 'logstash-winston-3';

describe('SignedUrlService', () => {
  let service: SignedUrlService;
  let logger: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignedUrlService,
        {
          provide: 'Logger',
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SignedUrlService>(SignedUrlService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate signed URL', async () => {
    const result = await service.get({
      transactionId: 'test-transaction',
      storageId: 'storage-1',
      expiresIn: 60,
    });

    expect(result.url).toContain('https://storage.example.com/files/storage-1');
    expect(result.url).toContain('expires=');
    expect(result.url).toContain('signature=mock-signature');
  });

  it('should use default expiresIn when not provided', async () => {
    const result = await service.get({
      transactionId: 'test-transaction',
      storageId: 'storage-1',
    });

    expect(result.url).toContain('https://storage.example.com/files/storage-1');
  });
});
