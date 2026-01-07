"use client";

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import "../global.css";
import '../i18n/config';
import { SettingsProvider, useSettings } from '@/components';
import { DrivingSessionsProvider } from '@/hooks';

function TabsLayout() {
    const settings = useSettings();
    const { t } = useTranslation();
    const isDark = settings.isDark;
    const insets = useSafeAreaInsets();

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={isDark ? '#1f2937' : '#ffffff'} />
            <Tabs
            key={settings.themeMode} // Force re-render when the theme changes
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 70 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 10,
                    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderTopColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'transparent',
                },
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: isDark ? '#9ca3af' : '#9ca3af',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.home'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: t('tabs.stats'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: t('tabs.history'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="car" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
        </>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SettingsProvider>
                <DrivingSessionsProvider>
                    <TabsLayout />
                </DrivingSessionsProvider>
            </SettingsProvider>
        </GestureHandlerRootView>
    );
}
