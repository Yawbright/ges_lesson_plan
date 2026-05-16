import { router } from 'expo-router';
import LandingPage from './landingpage';

export default function Entry() {
  return <LandingPage onGetAccess={() => router.push('/(auth)/sign-in')} />;
}
