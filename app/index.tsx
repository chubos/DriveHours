/**
 * Main page of DriveHours app - displays driving progress
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ProgressCircle, SettingsButton, AddSessionModal, useSettings } from '@/components';
import { useDrivingSessions } from '@/hooks';
import {
    getColors,
    calculateTotalMinutes,
    calculateProgress,
    formatHours,
    calculateRemainingHours,
    getSelectedCategory,
    createDrivingSession,
} from '@/utils';

export default function HomePage() {
    // Hooks
    const { t } = useTranslation();
    const settings = useSettings();
    const { sessions, addSession } = useDrivingSessions();
    const colors = getColors(settings.isDark);
    const timeoutRefs = useRef<number[]>([]);

    // Local state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            timeoutRefs.current.forEach(id => clearTimeout(id));
            timeoutRefs.current = [];
        };
    }, []);

    // Force refresh when returning to the screen
    useFocusEffect(
        useCallback(() => {
            setRefreshKey(prev => prev + 1);
        }, [])
    );

    // Calculations
    const selectedCategory = getSelectedCategory(
        settings.categories,
        settings.selectedCategoryId
    );
    const requiredMinutes = selectedCategory?.requiredMinutes ?? 30 * 60;
    const maxHours = Math.ceil(requiredMinutes / 60); // Maximum hours for category
    const totalMinutes = calculateTotalMinutes(sessions, settings.selectedCategoryId);
    const progress = calculateProgress(totalMinutes, requiredMinutes);
    const hoursDisplay = formatHours(totalMinutes);
    const remainingHours = calculateRemainingHours(totalMinutes, requiredMinutes);

    // Handle adding session
    const handleAddSession = async () => {
        const totalTime = hours * 60 + minutes;
        if (totalTime === 0) return;

        const newSession = createDrivingSession(
            hours,
            minutes,
            settings.selectedCategoryId
        );

        const success = await addSession(newSession);

        if (success) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Wait a moment for React to update the state
            const timeout1 = setTimeout(() => {
                setIsModalVisible(false);
                setHours(0);
                setMinutes(0);

                // Force refresh after closing modal
                const timeout2 = setTimeout(() => {
                    setRefreshKey(prev => prev + 1);

                    // Remove timeouts from tracking after they execute
                    timeoutRefs.current = timeoutRefs.current.filter(
                        id => id !== timeout1 && id !== timeout2
                    );
                }, 100);

                timeoutRefs.current.push(timeout2);
            }, 100);

            timeoutRefs.current.push(timeout1);
        }
    };

    return (
        <View
            key={refreshKey}
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background,
                padding: 24
            }}
        >
            {/* Settings button - rendered outside the main content to prevent blocking */}
            <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
                <SettingsButton onPress={settings.open} isDark={settings.isDark} />
            </View>

            {/* Category name */}
            <Text style={{
                color: colors.text,
                fontSize: 36,
                fontWeight: 'bold',
                marginBottom: 24,
                marginTop: 4
            }}>
                {t('home.category')} {selectedCategory?.name || 'B'}
            </Text>

            {/* Header */}
            <Text style={{
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 20,
                fontWeight: '500'
            }}>
                {t('home.title')}
            </Text>

            {/* Progress circle */}
            <ProgressCircle progress={progress} label={`${hoursDisplay}h`} isDark={settings.isDark} />

            {/* Information and actions */}
            <View style={{ marginTop: 48, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, marginBottom: 24, fontWeight: '500' }}>
                    {t('home.remaining')}: {remainingHours} h
                </Text>

                <TouchableOpacity
                    onPress={() => setIsModalVisible(true)}
                    style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: 48,
                        paddingVertical: 16,
                        borderRadius: 999,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{t('home.addSession')}</Text>
                </TouchableOpacity>
            </View>

            {/* Add session modal */}
            <AddSessionModal
                visible={isModalVisible}
                hours={hours}
                minutes={minutes}
                onHoursChange={setHours}
                onMinutesChange={setMinutes}
                onSave={handleAddSession}
                onCancel={() => setIsModalVisible(false)}
                maxHours={maxHours}
                isDark={settings.isDark}
            />
        </View>
    );
}