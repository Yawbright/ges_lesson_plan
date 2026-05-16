import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from '@/components/ToastProvider';
import { brandIdentity, colors, ThemeProvider } from '@/theme/colors';

const APP_NAME = brandIdentity.name;
const APP_DESCRIPTION = brandIdentity.description;
const APP_TAGLINE = brandIdentity.tagline;
const THEME_COLOR = brandIdentity.themeColor;
const APP_URL = 'https://geslessonplanner.netlify.app/';
const OG_IMAGE = `${APP_URL}og-image.png`;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <Head>
              <title>{APP_NAME}</title>
              <meta name="description" content={APP_DESCRIPTION} />
              <meta name="theme-color" content={THEME_COLOR} />
              <meta name="application-name" content={APP_NAME} />
              <meta name="apple-mobile-web-app-title" content={APP_NAME} />
              <meta name="mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
              <meta property="og:type" content="website" />
              <meta property="og:site_name" content={APP_NAME} />
              <meta property="og:title" content={`${APP_NAME} — ${APP_TAGLINE}`} />
              <meta property="og:description" content={APP_DESCRIPTION} />
              <meta property="og:url" content={APP_URL} />
              <meta property="og:image" content={OG_IMAGE} />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={APP_NAME} />
              <meta name="twitter:description" content={APP_DESCRIPTION} />
              <meta name="twitter:image" content={OG_IMAGE} />
              <link rel="icon" type="image/png" href="/favicon.png" />
              <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
              <link rel="manifest" href="/site.webmanifest" />
            </Head>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.primaryDark },
                headerTintColor: colors.textOnPrimary,
                headerTitleStyle: { fontWeight: '700' },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="landingpage" options={{ headerShown: false }} />
            <Stack.Screen
              name="tools/lesson-plan"
              options={{ title: 'Lesson Plan Tool' }}
            />
            <Stack.Screen
              name="tools/scheme"
              options={{ title: 'Scheme Tool' }}
            />
            <Stack.Screen
              name="tools/scheme-builder"
              options={{ title: 'Scheme Builder' }}
            />
            <Stack.Screen
              name="tools/teaching-notes"
              options={{ title: 'Teaching Notes' }}
            />
            <Stack.Screen
              name="teaching-note/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="lesson/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="lesson/week"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="scheme/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="admin" options={{ title: 'Admin' }} />
            <Stack.Screen name="onboarding" options={{ title: 'Teacher Setup', headerShown: false }} />
            </Stack>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
