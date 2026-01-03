import { IsInt, IsNotEmpty, Min, IsPositive } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  @IsInt()
  @Min(1)
  seatCount: number;

  @IsPositive()
  totalPrice: number;
}