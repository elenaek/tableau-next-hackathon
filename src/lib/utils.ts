import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LOCAL_STORAGE_KEYS = {
  DEMO_BANNER: 'demoBanner',
  PROJECT_BANNER: 'projectBanner',
  PATIENT_DATA_CACHE: 'patientDataCache',
}