import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          height: 62,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarIconStyle: {
          marginBottom: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          lineHeight: 12,
        },
      }}
    >
      <Tabs.Screen
        name="generate"
        options={{
          title: 'Generate',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={Math.min(size, 19)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={Math.min(size, 19)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schemes"
        options={{
          title: 'Schemes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={Math.min(size, 19)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="credits"
        options={{
          title: 'Credits',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={Math.min(size, 19)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={Math.min(size, 19)} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
