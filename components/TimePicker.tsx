import React from "react";
import { View, Text, Platform, useColorScheme } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from 'react-i18next';
import { getColors } from '@/utils';

interface Props {
    hours: number;
    minutes: number;
    setHours: (v: number) => void;
    setMinutes: (v: number) => void;
    maxHours?: number;
    isDark?: boolean;
}

export default function TimePicker({
    hours,
    minutes,
    setHours,
    setMinutes,
    maxHours = 30,
    isDark = false,
}: Props) {
    const { t } = useTranslation();
    const colors = getColors(isDark);

    // Detect system color scheme - Picker uses system theme on Android, not app theme
    const systemColorScheme = useColorScheme();
    const isSystemDark = systemColorScheme === 'dark';

    // On Android, Picker always uses system theme colors, so we need to match text color to system theme
    // regardless of app theme setting
    const androidTextColor = Platform.OS === 'android'
        ? (isSystemDark ? '#ffffff' : '#000000')
        : (isDark ? '#ffffff' : '#000000');

    const androidBgColor = isDark ? '#374151' : '#f3f4f6';
    const pickerTextColor = Platform.OS === 'android' ? androidTextColor : colors.text;

    const containerStyle = Platform.OS === 'android' ? {
        backgroundColor: androidBgColor,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#4b5563' : '#d1d5db',
        paddingHorizontal: 8,
        overflow: 'hidden' as const
    } : {
        backgroundColor: 'transparent',
        borderRadius: 12,
        overflow: 'hidden' as const
    };

    const pickerStyle = Platform.OS === 'android' ? {
        width: 100,
        height: 50,
        color: androidTextColor,
        backgroundColor: androidBgColor,
    } : {
        width: 100,
        color: colors.text,
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <View style={containerStyle}>
                <Text style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'android' ? 0 : 4,
                    marginTop: Platform.OS === 'android' ? 8 : 0,
                    color: colors.text,
                    paddingTop: Platform.OS === 'android' ? 0 : 8,
                    fontSize: 12
                }}>
                    {t('modal.hours')}
                </Text>
                <Picker
                    selectedValue={hours}
                    onValueChange={(value) => setHours(Number(value))}
                    style={pickerStyle}
                    itemStyle={{ color: pickerTextColor }}
                    dropdownIconColor={androidTextColor}
                    mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                >
                    {Array.from({ length: maxHours + 1 }, (_, i) => (
                        <Picker.Item
                            key={i}
                            label={`${i}`}
                            value={i}
                            color={Platform.OS === 'android' ? androidTextColor : pickerTextColor}
                        />
                    ))}
                </Picker>
            </View>

            <View style={containerStyle}>
                <Text style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'android' ? 0 : 4,
                    marginTop: Platform.OS === 'android' ? 8 : 0,
                    color: colors.text,
                    paddingTop: Platform.OS === 'android' ? 0 : 8,
                    fontSize: 12
                }}>
                    {t('modal.minutes')}
                </Text>
                <Picker
                    selectedValue={minutes}
                    onValueChange={(value) => setMinutes(Number(value))}
                    style={pickerStyle}
                    itemStyle={{ color: pickerTextColor }}
                    dropdownIconColor={androidTextColor}
                    mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                >
                    {Array.from({ length: 60 }, (_, i) => (
                        <Picker.Item
                            key={i}
                            label={`${i}`}
                            value={i}
                            color={Platform.OS === 'android' ? androidTextColor : pickerTextColor}
                        />
                    ))}
                </Picker>
            </View>
        </View>
    );
}
