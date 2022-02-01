import { ApiProperty } from '@nestjs/swagger';

export class CommissionResponseTdo {
  @ApiProperty()
  amount: string;

  @ApiProperty()
  currency: string;
}
