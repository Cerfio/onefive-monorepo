import { Controller, Get, Query, Req } from '@nestjs/common';
import { ListSpotlightResponseDto } from './dto/spotlight-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { ListSpotlightHandler } from './handlers/list-spotlight.handler';
import { FastifyRequest } from 'fastify';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListSpotlightQueryDto {
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @IsNumber()
  @Type(() => Number)
  lng: number;

  @IsOptional()
  @IsString()
  spot?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  cost?: string;

  @IsOptional()
  @IsString()
  expertiseDomains?: string;

  @IsOptional()
  @IsString()
  beginDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  radius?: number;
}

@Controller('spotlight')
export class SpotlightController {
  constructor(private readonly listSpotlightHandler: ListSpotlightHandler) {}

  @Get()
  async list(
    @Req() req: FastifyRequest,
    @Query() query: ListSpotlightQueryDto,
  ): Promise<ApiResponseDto<ListSpotlightResponseDto>> {
    const payload = await this.listSpotlightHandler.execute({
      transactionId: req.id,
      lat: query.lat,
      lng: query.lng,
      spot: query.spot,
      provider: query.provider,
      cost: query.cost,
      expertiseDomains: query.expertiseDomains,
      beginDate: query.beginDate,
      endDate: query.endDate,
      take: query.take,
      skip: query.skip,
      radius: query.radius,
    });

    return {
      success: true,
      data: payload,
    };
  }
}
