import { ApiProperty } from '@nestjs/swagger';

export class CommissionRequestTdo {
  @ApiProperty()
  date: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  client_id: number;
}
