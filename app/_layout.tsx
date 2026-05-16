import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from '@/components/ToastProvider';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <Head>
            <title>Ghana Lesson Planner</title>
            <meta
              name="description"
              content="AI-powered lesson plans and schemes for Ghanaian classrooms."
            />
            <meta name="theme-color" content="#0F4C3A" />
            <meta name="application-name" content="Ghana Lesson Planner" />
            <meta name="apple-mobile-web-app-title" content="Ghana Lesson Planner" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Ghana Lesson Planner" />
            <meta property="og:title" content="Ghana Lesson Planner" />
            <meta
              property="og:description"
              content="Create Ghanaian lesson plans, schemes of learning, and printable classroom documents with AI."
            />
            <meta property="og:url" content="https://geslessonplanner.netlify.app/" />
            <meta property="og:image" content="https://geslessonplanner.netlify.app/og-image.png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Ghana Lesson Planner" />
            <meta
              name="twitter:description"
              content="AI-powered lesson plans and schemes for Ghanaian classrooms."
            />
            <meta name="twitter:image" content="https://geslessonplanner.netlify.app/og-image.png" />
            <link rel="icon" type="image/png" href="/favicon.png" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/site.webmanifest" />
          </Head>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '700' },
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
