import { IsNotEmpty, IsString, IsNumber, Min, IsDateString, IsOptional } from 'class-validator';

export class CreateFlightDto {
  @IsString()
  @IsNotEmpty()
  flightCode: string; // ✅ บังคับชื่อนี้ (CamelCase)

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsNotEmpty()
  travelDate: string; // ✅ บังคับชื่อนี้ (รับเป็น String วันที่)

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  availableSeats: number; // ✅ บังคับชื่อนี้
}