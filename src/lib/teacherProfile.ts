import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const STORAGE_KEY = 'teacher-profile';

export type TeacherProfile = {
  teacherName: string;
  schoolName: string;
  schoolDistrict: string;
  classSizes: Record<string, string>;
  onboardingCompleted: boolean;
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
  await saveRemoteTeacherProfile(profile).catch(() => undefined);
}

export async function isTeacherOnboardingComplete() {
  const profile = await loadTeacherProfile();
  return Boolean(
    profile.onboardingCompleted ||
      (profile.teacherName.trim() && profile.schoolName.trim() && Object.keys(profile.classSizes).length),
  );
}

export function emptyTeacherProfile(): TeacherProfile {
  return {
    teacherName: '',
    schoolName: '',
    schoolDistrict: '',
    classSizes: {},
    onboardingCompleted: false,
  };
}

async function saveRemoteTeacherProfile(profile: TeacherProfile) {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return;

  await supabase.from('teacher_profiles').upsert({
    user_id: userId,
    teacher_name: profile.teacherName,
    school_name: profile.schoolName,
    school_district: profile.schoolDistrict,
    class_sizes: profile.classSizes,
    onboarding_completed: profile.onboardingCompleted,
    updated_at: new Date().toISOString(),
  });
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
