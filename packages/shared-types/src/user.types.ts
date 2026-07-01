import { UserRole } from './enums';

export interface UserPreferences {
  lang: 'ar' | 'en';
  mode: 'light' | 'dark';
}

export interface SubscriptionInfo {
  plan: string | null;
  status: string | null;
  totalStudents: number;
  totalStorageBytes: number;
  maxTotalStudents: number;
  pricePerStudent: number;
  baseStorageBytes: number;
  totalAddonStorageBytes: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  profileImageUrl?: string | null;
  preferences?: UserPreferences;
  createdAt: string;
  subscription?: SubscriptionInfo | null;
}

