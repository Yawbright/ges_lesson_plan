import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerBackground: () => <BrandedHeaderBackground />,
        headerTintColor: '#fff',
        headerTitle: () => <AppHeaderTitle />,
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
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={Math.min(size, 19)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{ href: null }}
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
        options={{ href: null }}
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

function AppHeaderTitle() {
  return (
    <View style={styles.headerBrand}>
      <Image source={require('../../assets/icon.png')} style={styles.headerLogo} />
      <Text style={styles.headerBrandText}>GES AI Lesson Planner</Text>
    </View>
  );
}

function BrandedHeaderBackground() {
  return (
    <View style={styles.headerBackground}>
      <View style={styles.flagRibbon}>
        <View style={[styles.flagBand, styles.flagRed]} />
        <View style={[styles.flagBand, styles.flagGold]}>
          <Ionicons name="star" size={9} color="#111" />
        </View>
        <View style={[styles.flagBand, styles.flagGreen]} />
      </View>
      <View style={styles.headerGlow} />
      <View style={styles.goldRule} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    flex: 1,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  flagRibbon: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 18,
  },
  flagBand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagRed: { backgroundColor: '#CE1126' },
  flagGold: { backgroundColor: '#FCD116' },
  flagGreen: { backgroundColor: '#006B3F' },
  headerGlow: {
    position: 'absolute',
    left: 18,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  goldRule: {
    position: 'absolute',
    left: 18,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: '#FCD116',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  headerBrandText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
