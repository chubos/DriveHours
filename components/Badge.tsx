/**
 * Component that displays a user achievement badge
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '@/utils';

interface BadgeProps {
    active: boolean;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    color: string;
    isDark?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ active, label, iconName, color, isDark = false }) => {
    const colors = getColors(isDark);

    const containerStyle: any = {
        flex: 0.48,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        marginHorizontal: 4,
        borderWidth: 1,
        backgroundColor: active ? colors.surface : colors.background,
        borderColor: active ? (isDark ? colors.border : 'rgba(219,234,254,1)') : 'transparent',
        opacity: active ? 1 : 0.4,
        shadowColor: '#000',
        shadowOpacity: active ? 0.05 : 0,
        shadowRadius: active ? 6 : 0,
    };

    return (
        <View style={containerStyle}>
            <Ionicons
                name={iconName}
                size={32}
                color={active ? color : colors.textTertiary}
                style={{ marginBottom: 8 }}
            />
            <Text
                style={{
                    fontSize: 9,
                    fontWeight: '900',
                    textAlign: 'center',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                }}
            >
                {label}
            </Text>
        </View>
    );
};
