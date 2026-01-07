/**
 * Settings button component
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SettingsButtonProps {
    onPress: () => void;
    isDark?: boolean;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onPress, isDark = false }) => {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
    };

    return (
        <View
            style={{
                position: 'absolute',
                right: 20,
                top: 65,
                zIndex: 9999,
                elevation: 10,
            }}
            pointerEvents="box-none"
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                accessibilityLabel="Open settings"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: 8,
                    borderWidth: isDark ? 1 : 0,
                    borderColor: isDark ? 'rgba(75, 85, 99, 0.5)' : 'transparent',
                }}
            >
                <Ionicons name="settings-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
        </View>
    );
};
