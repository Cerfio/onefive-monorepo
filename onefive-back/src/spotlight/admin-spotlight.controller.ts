import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminSpotResponseDto } from './dto/spotlight-response.dto';
import { SpotlightService } from './spotlight.service';
import { CreateSpotDto } from './dto/create-spot.dto';
import { SpotType } from '@prisma/client';

@Controller('admin/spotlight')
@UseGuards(AdminGuard)
export class AdminSpotlightController {
  constructor(private readonly spotlightService: SpotlightService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSpot(
    @Body() createSpotDto: CreateSpotDto,
  ): Promise<AdminSpotResponseDto> {
    // Validation spécifique par type de spot
    this.validateSpotData(createSpotDto);

    const spot = await this.spotlightService.create({
      transactionId: `admin-create-${Date.now()}`,
      spotData: createSpotDto,
    });

    return {
      success: true,
      message: 'Spot created successfully',
      data: {
        id: spot.id,
        spot: spot.spot,
        name: spot.name,
      },
    };
  }

  @Put(':id')
  async updateSpot(
    @Param('id') id: string,
    @Body() updateSpotDto: Partial<CreateSpotDto>,
  ): Promise<AdminSpotResponseDto> {
    const spot = await this.spotlightService.update(id, {
      transactionId: `admin-update-${Date.now()}`,
      spotData: updateSpotDto,
    });

    return {
      success: true,
      message: 'Spot updated successfully',
      data: {
        id: spot.id,
        spot: spot.spot,
        name: spot.name,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpot(@Param('id') id: string): Promise<void> {
    await this.spotlightService.delete(id, `admin-delete-${Date.now()}`);
  }

  private validateSpotData(createSpotDto: CreateSpotDto): void {
    const { spot } = createSpotDto;

    switch (spot) {
      case SpotType.EVENT:
        if (!createSpotDto.event) {
          throw new BadRequestException(
            'Event data is required for EVENT type spots',
          );
        }
        break;
      case SpotType.CONTEST:
        if (!createSpotDto.contest) {
          throw new BadRequestException(
            'Contest data is required for CONTEST type spots',
          );
        }
        break;
      case SpotType.INCUBATOR:
        if (!createSpotDto.incubator) {
          throw new BadRequestException(
            'Incubator data is required for INCUBATOR type spots',
          );
        }
        break;
      case SpotType.ACCELERATOR:
        if (!createSpotDto.accelerator) {
          throw new BadRequestException(
            'Accelerator data is required for ACCELERATOR type spots',
          );
        }
        break;
      case SpotType.COWORKINGSPACE:
        if (!createSpotDto.coworkingSpace) {
          throw new BadRequestException(
            'CoworkingSpace data is required for COWORKINGSPACE type spots',
          );
        }
        break;
      default:
        throw new BadRequestException(`Invalid spot type: ${spot}`);
    }
  }
}
