export class CreatePartnerDto {
  email: string;
  username: string;
  password: string;
  avatar?: string;
  phone?: string;
  country?: string;
  region?: string;
  types: string[];
  description?: string;
  regions: string[];
  services?: string[];
}
