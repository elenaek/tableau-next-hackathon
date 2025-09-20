import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LOCAL_STORAGE_KEYS = {
  DEMO_BANNER: 'demoBanner',
  PROJECT_BANNER: 'projectBanner',
  PATIENT_DATA_CACHE: 'patientDataCache',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  CHAT_STATE: 'chatState',
  MEDICAL_RECORDS_DATA: 'medicalRecordsData',
  VITALS_DATA: 'vitalsData',
  DEPARTMENT_BUSYNESS_DATA: 'departmentBusynessData',
}