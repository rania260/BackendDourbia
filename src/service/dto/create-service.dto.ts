export class CreateServiceDto {
  service: string;
  type: string;
  description?: string;
  regions: string[];
  prix: number;
  requiresReservation?: boolean;
}
  