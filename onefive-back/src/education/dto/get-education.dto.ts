export class GetEducationDto {
  id: string;
  degree: string;
  school: string;
  domain?: string;
  city: string;
  from: Date;
  to?: Date;
  description?: string;
  urlLinkedin?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  profileId: string;
}
