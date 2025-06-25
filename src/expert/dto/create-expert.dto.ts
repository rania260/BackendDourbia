export class CreateExpertDto {
    email: string;
    username: string;
    password: string;
    country?: string;
    region?: string;
    specialities: string[];
    description?: string;
    epochs: string[];
  }