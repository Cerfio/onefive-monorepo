import { Test, TestingModule } from '@nestjs/testing';
import { NetworkView } from '../dto/get-network-people.dto';
import { ListNetworkPeopleHandler } from './list-network-people.handler';
import { NetworkService } from '../network.service';
import { LogService } from 'logstash-winston-3';

describe('ListNetworkPeopleHandler', () => {
  let handler: ListNetworkPeopleHandler;
  let networkService: NetworkService;
  let logger: LogService;

  const mockNetworkService = {
    getNetworkPeople: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListNetworkPeopleHandler,
        {
          provide: NetworkService,
          useValue: mockNetworkService,
        },
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<ListNetworkPeopleHandler>(ListNetworkPeopleHandler);
    networkService = module.get<NetworkService>(NetworkService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call networkService.getNetworkPeople with correct parameters', async () => {
      const mockResult = [
        {
          id: 'profile-1',
          name: 'John Doe',
          avatar: '/avatar.jpg',
          title: 'Entrepreneur',
          location: 'Paris, France',
          countryCode: 'FR',
          intention: 'Cherche des opportunités',
          intentionCategory: 'opportunities',
          role: 'entrepreneur',
          tags: ['Entrepreneur'],
          experience: [],
          education: [],
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockNetworkService.getNetworkPeople.mockResolvedValue(mockResult as any);

      const transactionId = 'transaction-123';
      const userId = 'user-123';
      const filters = { view: NetworkView.DISCOVER, limit: 10, offset: 0 };

      const result = await handler.execute({
        transactionId,
        userId,
        filters,
      });

      expect(mockNetworkService.getNetworkPeople).toHaveBeenCalledWith({
        transactionId,
        userId,
        filters,
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Listing network people', {
        transactionId,
        userId,
        filters,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Network people retrieved successfully',
        {
          transactionId,
          userId,
          count: mockResult.length,
        },
      );

      expect(result).toEqual(mockResult);
    });

    it('should handle empty results', async () => {
      mockNetworkService.getNetworkPeople.mockResolvedValue([] as any);

      const result = await handler.execute({
        transactionId: 'tx-456',
        userId: 'user-456',
        filters: { view: NetworkView.DISCOVER, limit: 5, offset: 0 },
      });

      expect(result).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Network people retrieved successfully',
        {
          transactionId: 'tx-456',
          userId: 'user-456',
          count: 0,
        },
      );
    });

    it('should propagate errors from networkService', async () => {
      const error = new Error('Database connection failed');
      mockNetworkService.getNetworkPeople.mockRejectedValue(error);

      await expect(
        handler.execute({
          transactionId: 'tx-789',
          userId: 'user-789',
          filters: { view: NetworkView.DISCOVER, limit: 10, offset: 0 },
        }),
      ).rejects.toThrow(error);
    });
  });
});
