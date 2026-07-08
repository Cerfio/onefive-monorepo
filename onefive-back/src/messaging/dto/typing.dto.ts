import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class TypingDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsIn(['start', 'stop'])
  state: 'start' | 'stop';
}
