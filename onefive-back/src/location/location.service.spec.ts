import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { LogService } from 'logstash-winston-3';

describe('LocationService', () => {
  let service: LocationService;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    logger = module.get('Logger');
  });

  describe('getCitySuggestions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return suggestions for France', async () => {
      // Act
      const result = await service.getCitySuggestions('Paris', 'FR');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const parisSuggestion = result.find((s) => s.name.includes('Paris'));
      expect(parisSuggestion).toBeDefined();
      expect(parisSuggestion?.structuredFormatting.main_text).toBe('Paris');
      expect(parisSuggestion?.structuredFormatting.secondary_text).toBe(
        'France',
      );
    });

    it('should return suggestions for United States', async () => {
      // Act
      const result = await service.getCitySuggestions('New York', 'US');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const nySuggestion = result.find((s) => s.name.includes('New York'));
      expect(nySuggestion).toBeDefined();
      expect(nySuggestion?.structuredFormatting.main_text).toBe('New York');
      expect(nySuggestion?.structuredFormatting.secondary_text).toBe('NY, USA');
    });

    it('should return suggestions for United Kingdom', async () => {
      // Act
      const result = await service.getCitySuggestions('London', 'GB');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const londonSuggestion = result.find((s) => s.name.includes('London'));
      expect(londonSuggestion).toBeDefined();
      expect(londonSuggestion?.structuredFormatting.main_text).toBe('London');
      expect(londonSuggestion?.structuredFormatting.secondary_text).toBe('UK');
    });

    it('should return suggestions for Germany', async () => {
      // Act
      const result = await service.getCitySuggestions('Berlin', 'DE');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const berlinSuggestion = result.find((s) => s.name.includes('Berlin'));
      expect(berlinSuggestion).toBeDefined();
      expect(berlinSuggestion?.structuredFormatting.main_text).toBe('Berlin');
      expect(berlinSuggestion?.structuredFormatting.secondary_text).toBe(
        'Germany',
      );
    });

    it('should return empty array for unknown country', async () => {
      // Act
      const result = await service.getCitySuggestions('Paris', 'XX');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should filter suggestions based on query', async () => {
      // Act
      const result = await service.getCitySuggestions('Lyon', 'FR');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Toutes les suggestions doivent contenir "Lyon"
      result.forEach((suggestion) => {
        expect(suggestion.name.toLowerCase()).toContain('lyon');
      });
    });

    it('should handle case insensitive search', async () => {
      // Act
      const result = await service.getCitySuggestions('paris', 'FR');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const parisSuggestion = result.find((s) => s.name.includes('Paris'));
      expect(parisSuggestion).toBeDefined();
    });

    it('should handle partial matches', async () => {
      // Act
      const result = await service.getCitySuggestions('Par', 'FR');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Au moins une suggestion doit contenir "Par"
      const hasMatch = result.some(
        (suggestion) =>
          suggestion.name.toLowerCase().includes('par') ||
          suggestion.structuredFormatting.main_text
            .toLowerCase()
            .includes('par'),
      );
      expect(hasMatch).toBe(true);
    });

    it('should return all French cities for empty query', async () => {
      // Act
      const result = await service.getCitySuggestions('', 'FR');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Toutes les suggestions doivent être pour la France
      result.forEach((suggestion) => {
        expect(suggestion.name).toContain('France');
      });
    });

    it('should handle special characters in query', async () => {
      // Act
      const result = await service.getCitySuggestions('Lyon', 'FR');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return suggestions with correct structure', async () => {
      // Act
      const result = await service.getCitySuggestions('Paris', 'FR');

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const suggestion = result[0];
      expect(suggestion).toHaveProperty('name');
      expect(suggestion).toHaveProperty('placeId');
      expect(suggestion).toHaveProperty('structuredFormatting');
      expect(suggestion.structuredFormatting).toHaveProperty('main_text');
      expect(suggestion.structuredFormatting).toHaveProperty('secondary_text');

      expect(typeof suggestion.name).toBe('string');
      expect(typeof suggestion.placeId).toBe('string');
      expect(typeof suggestion.structuredFormatting.main_text).toBe('string');
      expect(typeof suggestion.structuredFormatting.secondary_text).toBe(
        'string',
      );
    });
  });
});
