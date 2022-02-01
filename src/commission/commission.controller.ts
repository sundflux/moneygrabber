import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CommissionService } from './commission.service';
import { CommissionRequestTdo } from './dto/commissionRequest.tdo';
import { CommissionResponseTdo } from './dto/commissionResponse.dto';

@ApiTags('Commission API')
@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @ApiCreatedResponse({ type: CommissionResponseTdo })
  @Post()
  calculateCommission(
    @Body() commissionRequest: CommissionRequestTdo,
  ): CommissionResponseTdo {
    return this.commissionService.calculateCommission(commissionRequest);
  }
}
