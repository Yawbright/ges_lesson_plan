import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'teacher-profile';

export type TeacherProfile = {
  teacherName: string;
  schoolName: string;
  schoolDistrict: string;
  classSizes: Record<string, string>;
};

export async function loadTeacherProfile(): Promise<TeacherProfile> {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return emptyTeacherProfile();

  try {
    return { ...emptyTeacherProfile(), ...(JSON.parse(raw) as Partial<TeacherProfile>) };
  } catch {
    return emptyTeacherProfile();
  }
}

export async function saveTeacherProfile(profile: TeacherProfile) {
  await storage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function emptyTeacherProfile(): TeacherProfile {
  return {
    teacherName: '',
    schoolName: '',
    schoolDistrict: '',
    classSizes: {},
  };
}

const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
};
