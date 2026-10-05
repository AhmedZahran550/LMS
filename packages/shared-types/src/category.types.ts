export interface CategoryResponseDto {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  nameAr: string;
  slug?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  nameAr?: string;
  slug?: string;
  isActive?: boolean;
}
