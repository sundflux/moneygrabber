import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';

@Module({
  imports: [HttpModule],
  controllers: [CommissionController],
  providers: [CommissionService],
})
export class CommissionModule {}
