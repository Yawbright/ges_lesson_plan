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
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (userId) {
    const remote = await loadRemoteTeacherProfile(userId).catch(() => null);
    if (remote) {
      await storage.setItem(scopedStorageKey(userId), JSON.stringify(remote));
      return remote;
    }
    return emptyTeacherProfile();
  }

  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return emptyTeacherProfile();

  try {
    return { ...emptyTeacherProfile(), ...(JSON.parse(raw) as Partial<TeacherProfile>) };
  } catch {
    return emptyTeacherProfile();
  }
}

export async function saveTeacherProfile(profile: TeacherProfile) {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (userId) {
    await storage.setItem(scopedStorageKey(userId), JSON.stringify(profile));
    await saveRemoteTeacherProfile(userId, profile);
    return;
  }
  await storage.setItem(STORAGE_KEY, JSON.stringify(profile));
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

async function loadRemoteTeacherProfile(userId: string): Promise<TeacherProfile | null> {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select('teacher_name,school_name,school_district,class_sizes,onboarding_completed')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    teacherName: data.teacher_name ?? '',
    schoolName: data.school_name ?? '',
    schoolDistrict: data.school_district ?? '',
    classSizes: (data.class_sizes as Record<string, string>) ?? {},
    onboardingCompleted: Boolean(data.onboarding_completed),
  };
}

async function saveRemoteTeacherProfile(userId: string, profile: TeacherProfile) {
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

function scopedStorageKey(userId: string) {
  return `${STORAGE_KEY}:${userId}`;
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
