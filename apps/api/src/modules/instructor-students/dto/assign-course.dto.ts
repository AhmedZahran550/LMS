import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class AssignCourseDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  courseIds?: string[];
}
