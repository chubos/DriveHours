/**
 * Modal for adding a new driving session
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import * as NavigationBar from 'expo-navigation-bar';
import TimePicker from './TimePicker';
import { getColors } from '@/utils';

interface AddSessionModalProps {
    visible: boolean;
    hours: number;
    minutes: number;
    onHoursChange: (value: number) => void;
    onMinutesChange: (value: number) => void;
    onSave: () => void;
    onCancel: () => void;
    maxHours?: number;
    isDark?: boolean;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
    visible,
    hours,
    minutes,
    onHoursChange,
    onMinutesChange,
    onSave,
    onCancel,
    maxHours,
    isDark = false,
}) => {
    const { t } = useTranslation();
    const colors = getColors(isDark);
    const navBarUpdateTimeoutRef = useRef<number | null>(null);

    // Set navigation bar color when modal opens/closes on Android
    useEffect(() => {
        if (Platform.OS !== 'android') return;
        if (!visible) return;

        const updateNavigationBar = async () => {
            try {
                if (NavigationBar?.setButtonStyleAsync) {
                    await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
                }
            } catch {
                // Silently fail to prevent crashes
            }
        };

        // Clear previous timeout
        if (navBarUpdateTimeoutRef.current) {
            clearTimeout(navBarUpdateTimeoutRef.current);
        }

        // Debounce timer to prevent too many rapid updates
        navBarUpdateTimeoutRef.current = setTimeout(updateNavigationBar, 150);

        return () => {
            if (navBarUpdateTimeoutRef.current) {
                clearTimeout(navBarUpdateTimeoutRef.current);
            }
        };
    }, [visible, isDark]);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View style={{
                    backgroundColor: colors.surface,
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    padding: 32,
                    paddingBottom: 48
                }}>
                    <View style={{
                        width: 48,
                        height: 4,
                        backgroundColor: colors.border,
                        alignSelf: 'center',
                        borderRadius: 999,
                        marginBottom: 24
                    }} />
                    <Text style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: 32,
                        color: colors.text
                    }}>
                        {t('modal.addSession')}
                    </Text>
                    <TimePicker
                        hours={hours}
                        minutes={minutes}
                        setHours={onHoursChange}
                        setMinutes={onMinutesChange}
                        maxHours={maxHours}
                        isDark={isDark}
                    />
                    <TouchableOpacity
                        onPress={onSave}
                        style={{
                            backgroundColor: colors.primary,
                            paddingVertical: 16,
                            borderRadius: 16,
                            marginTop: 32
                        }}
                    >
                        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
                            {t('modal.add')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onCancel} style={{ marginTop: 16, marginBottom: 12 }}>
                        <Text style={{ textAlign: 'center', color: colors.textTertiary }}>{t('modal.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};
