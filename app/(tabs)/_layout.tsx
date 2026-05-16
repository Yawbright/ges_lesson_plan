import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brandIdentity, colors, radii, shadows, spacing, typography } from '@/theme/colors';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerBackground: () => <BrandedHeaderBackground />,
        headerTintColor: colors.textOnPrimary,
        headerTitle: () => <AppHeaderTitle />,
        headerRight: () => <HeaderQuickActions />,
        headerStyle: {
          height: 56 + insets.top,
        },
        headerStatusBarHeight: insets.top,
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: spacing[3],
          paddingBottom: insets.bottom + spacing[2],
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarItemStyle: {
          paddingVertical: spacing[2],
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'apps' : 'apps-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="generate" options={{ href: null }} />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'library' : 'library-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="schemes" options={{ href: null }} />
      <Tabs.Screen
        name="credits"
        options={{
          title: 'Credits',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'wallet' : 'wallet-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return <Ionicons name={name} size={22} color={color} />;
}

function AppHeaderTitle() {
  return (
    <View style={styles.headerBrand}>
      <View style={styles.headerMark}>
        <Text style={styles.headerMarkText}>GES</Text>
      </View>
      <View style={styles.headerBrandText}>
        <Text style={styles.headerBrandPrimary} numberOfLines={1}>
          {brandIdentity.name}
        </Text>
        <Text style={styles.headerTagline} numberOfLines={1}>
          {brandIdentity.tagline}
        </Text>
      </View>
    </View>
  );
}

function HeaderQuickActions() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open credits"
      onPress={() => router.push('/(tabs)/credits')}
      style={({ pressed }) => [styles.headerAction, pressed && styles.headerActionPressed]}
      hitSlop={8}
    >
      <Ionicons name="wallet-outline" size={16} color={colors.textOnPrimary} />
      <Text style={styles.headerActionText}>Credits</Text>
    </Pressable>
  );
}

function BrandedHeaderBackground() {
  return (
    <View style={styles.headerBackground}>
      <View style={styles.headerGradientBottom} />
      <View style={styles.headerAccentBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    overflow: 'hidden',
  },
  headerGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  headerAccentBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: colors.accent,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingLeft: Platform.OS === 'ios' ? 0 : spacing[2],
  },
  headerMark: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerMarkText: {
    color: colors.accentOn,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  headerBrandText: {
    flexShrink: 1,
  },
  headerBrandPrimary: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  headerTagline: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 11,
    marginTop: 1,
    maxWidth: 200,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginRight: spacing[4],
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  headerActionPressed: {
    opacity: 0.75,
  },
  headerActionText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
