"use client";

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";
import { SettingsProvider, useSettings } from '../components/SettingsDrawer';
import { DrivingSessionsProvider } from '../hooks/useDrivingSessions';

function TabsLayout() {
    const settings = useSettings();
    const isDark = settings.isDark; // Używamy isDark z settings

    return (
        <Tabs
            key={settings.themeMode} // Wymuszenie re-render przy zmianie motywu
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 90,
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
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: "Staty",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "Jazdy",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="car" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
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
