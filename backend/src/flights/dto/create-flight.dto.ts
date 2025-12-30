export class CreateFlightDto {
  flight_code: string;
  origin: string;
  destination: string;
  travelDate: string;
  price: number;
  availableSeats: number;
}