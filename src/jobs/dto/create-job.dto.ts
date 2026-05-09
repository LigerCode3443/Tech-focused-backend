import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Field selectedWish cannot be empty' })
  selectedWish: string;

  @IsNumber()
  @Min(0)
  @Max(1000)
  weight: number;
}
