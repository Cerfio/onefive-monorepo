import { Injectable } from '@nestjs/common';
import { Log } from '../logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject } from '@nestjs/common';

@Injectable()
export class GeolocationService {
  constructor(@Inject('Logger') private readonly logger: LogService) {}

  @Log()
  async getLocationFromIP(ipAddress: string): Promise<string> {
    try {
      // Skip geolocation for localhost/private IPs
      if (this.isPrivateIP(ipAddress) || ipAddress === 'unknown') {
        return 'Local Network';
      }

      // Use a free geolocation service with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const response = await fetch(`http://ipapi.co/${ipAddress}/json/`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          return 'Unknown Location';
        }

        const data = await response.json();

        if (data.city && data.country_name) {
          return `${data.city}, ${data.country_name}`;
        } else if (data.country_name) {
          return data.country_name;
        }

        return 'Unknown Location';
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          this.logger.warn('Geolocation request timed out', { ipAddress });
        } else {
          this.logger.warn('Geolocation request failed', {
            ipAddress,
            error: error.message,
          });
        }
        return 'Unknown Location';
      }
    } catch (error) {
      // Don't fail the session creation if geolocation fails
      this.logger.warn('Geolocation failed', {
        ipAddress,
        error: error.message,
      });
      return 'Unknown Location';
    }
  }

  private isPrivateIP(ip: string): boolean {
    // Check for private IP ranges
    const privateRanges = [
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^127\./, // 127.0.0.0/8 (localhost)
      /^169\.254\./, // 169.254.0.0/16 (link-local)
    ];

    return privateRanges.some((range) => range.test(ip));
  }
}
