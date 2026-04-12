import {
  Controller,
  HttpCode,
  Post,
  Body,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { CitySuggestionsResponseDto } from './dto/location-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { GetCitySuggestionsHandler } from './handlers/get-city-suggestions.handler';
import { GetCitySuggestionsDto } from './dto/get-city-suggestions.dto';

@Controller('location')
export class LocationController {
  constructor(
    private readonly getCitySuggestionsHandler: GetCitySuggestionsHandler,
  ) {}

  @Post('cities/suggestions')
  @HttpCode(200)
  async getCitySuggestions(
    @Req() req: FastifyRequest,
    @Body(ValidationPipe) body: GetCitySuggestionsDto,
  ): Promise<ApiResponseDto<CitySuggestionsResponseDto>> {
    const suggestions = await this.getCitySuggestionsHandler.execute({
      transactionId: req.id,
      query: body.query,
      countryCode: body.countryCode,
    });

    return {
      success: true,
      data: suggestions,
    };
  }
}
