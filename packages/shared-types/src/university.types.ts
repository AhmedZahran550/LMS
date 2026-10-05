export interface DepartmentData {
  name: string;
  nameAr: string;
}

export interface YearData {
  name: string;
  nameAr: string;
}

export interface FacultyData {
  name: string;
  nameAr: string;
  departments: DepartmentData[];
  years: YearData[];
}

export interface UniversityResponseDto {
  id: string;
  name: string;
  nameAr: string;
  faculties: FacultyData[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUniversityDto {
  name: string;
  nameAr: string;
  faculties: FacultyData[];
  isActive?: boolean;
}

export interface UpdateUniversityDto {
  name?: string;
  nameAr?: string;
  faculties?: FacultyData[];
  isActive?: boolean;
}
