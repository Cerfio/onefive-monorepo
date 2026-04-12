import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { LocationGetCitySuggestionsException } from './location.exception';

export interface CitySuggestion {
  name: string;
  placeId: string;
  structuredFormatting: {
    main_text: string;
    secondary_text: string;
  };
}

@Injectable()
export class LocationService {
  constructor(@Inject('Logger') private readonly logger: LogService) {}

  @Log()
  async getCitySuggestions(
    query: string,
    countryCode: string,
  ): Promise<CitySuggestion[]> {
    try {
      // Future: Google Places API. Actuellement: suggestions mockées
      return this.getMockSuggestions(query, countryCode);
    } catch (error) {
      LocationGetCitySuggestionsException.throw(this.logger, {
        query,
        countryCode,
        error: error.message,
      });
    }
  }

  private getMockSuggestions(
    query: string,
    countryCode: string,
  ): CitySuggestion[] {
    // Suggestions mockées pour les tests
    const mockSuggestions = {
      FR: [
        {
          name: 'Paris, France',
          placeId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
          structuredFormatting: {
            main_text: 'Paris',
            secondary_text: 'France',
          },
        },
        {
          name: 'Lyon, France',
          placeId: 'ChIJl4foalHq9EcR0pGp6WgVgB4',
          structuredFormatting: { main_text: 'Lyon', secondary_text: 'France' },
        },
        {
          name: 'Marseille, France',
          placeId: 'ChIJM8spCHcFzRIRiDCT_78l2x4',
          structuredFormatting: {
            main_text: 'Marseille',
            secondary_text: 'France',
          },
        },
        {
          name: 'Toulouse, France',
          placeId: 'ChIJ8ZqXrR7vrRIRiDCT_78l2x4',
          structuredFormatting: {
            main_text: 'Toulouse',
            secondary_text: 'France',
          },
        },
        {
          name: 'Nice, France',
          placeId: 'ChIJ8ZqXrR7vrRIRiDCT_78l2x4',
          structuredFormatting: { main_text: 'Nice', secondary_text: 'France' },
        },
      ],
      US: [
        {
          name: 'New York, NY, USA',
          placeId: 'ChIJOwg_06VPwokRYv534QaPC8g',
          structuredFormatting: {
            main_text: 'New York',
            secondary_text: 'NY, USA',
          },
        },
        {
          name: 'Los Angeles, CA, USA',
          placeId: 'ChIJE9on3F3HwoAR9AhGJW_fL-I',
          structuredFormatting: {
            main_text: 'Los Angeles',
            secondary_text: 'CA, USA',
          },
        },
        {
          name: 'Chicago, IL, USA',
          placeId: 'ChIJ7cv00DwsDogRAMDACa2m4K8',
          structuredFormatting: {
            main_text: 'Chicago',
            secondary_text: 'IL, USA',
          },
        },
      ],
      GB: [
        {
          name: 'London, UK',
          placeId: 'ChIJdd4hrwug2EcRmSrV3v6r4gc',
          structuredFormatting: { main_text: 'London', secondary_text: 'UK' },
        },
        {
          name: 'Manchester, UK',
          placeId: 'ChIJ2_UmUkxNekgRq2P7hR1T9Qk',
          structuredFormatting: {
            main_text: 'Manchester',
            secondary_text: 'UK',
          },
        },
      ],
      DE: [
        {
          name: 'Berlin, Germany',
          placeId: 'ChIJAVkDPzdZqEcRcDteW0YgIQQ',
          structuredFormatting: {
            main_text: 'Berlin',
            secondary_text: 'Germany',
          },
        },
        {
          name: 'Munich, Germany',
          placeId: 'ChIJ2V-Mo_l1nkcRfZixfUq4DAE',
          structuredFormatting: {
            main_text: 'Munich',
            secondary_text: 'Germany',
          },
        },
      ],
    };

    const suggestions = mockSuggestions[countryCode] || [];
    return suggestions.filter(
      (s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.structuredFormatting.main_text
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
  }
}
