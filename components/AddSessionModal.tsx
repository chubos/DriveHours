/**
 * Modal do dodawania nowej sesji jazdy
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import TimePicker from './TimePicker';
import { getColors } from '../utils/colors';

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
    const colors = getColors(isDark);

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
                        Ile dzisiaj?
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
                            Zapisz
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onCancel} style={{ marginTop: 16 }}>
                        <Text style={{ textAlign: 'center', color: colors.textTertiary }}>Anuluj</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};

