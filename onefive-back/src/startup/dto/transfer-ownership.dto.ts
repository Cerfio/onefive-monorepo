import { IsString, IsNotEmpty } from 'class-validator';

export class TransferOwnershipDto {
  @IsString()
  @IsNotEmpty()
  newOwnerMemberId: string;
}
