/**
 * Strona główna aplikacji DriveHours - wyświetla postęp nauki jazdy
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';

import ProgressCircle from '../components/ProgressCircle';
import { SettingsButton } from '../components/SettingsButton';
import { AddSessionModal } from '../components/AddSessionModal';
import { useSettings } from '../components/SettingsDrawer';
import { useDrivingSessions } from '../hooks';
import { getColors } from '../utils/colors';
import {
    calculateTotalMinutes,
    calculateProgress,
    formatHours,
    calculateRemainingHours,
    getSelectedCategory,
    createDrivingSession,
} from '../utils/calculations';

export default function HomePage() {
    // Hooks
    const settings = useSettings();
    const { sessions, addSession } = useDrivingSessions();
    const colors = getColors(settings.isDark);

    console.log('🏠 HOME - Liczba sesji:', sessions.length);


    // Stan lokalny
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Wymuszenie odświeżenia gdy wracamy do ekranu
    useFocusEffect(
        useCallback(() => {
            setRefreshKey(prev => prev + 1);
        }, [sessions, settings.selectedCategoryId])
    );

    // Obliczenia
    const selectedCategory = getSelectedCategory(
        settings.categories,
        settings.selectedCategoryId
    );
    const requiredMinutes = selectedCategory?.requiredMinutes ?? 30 * 60;
    const maxHours = Math.ceil(requiredMinutes / 60); // Maksymalna liczba godzin dla kategorii
    const totalMinutes = calculateTotalMinutes(sessions, settings.selectedCategoryId);
    const progress = calculateProgress(totalMinutes, requiredMinutes);
    const hoursDisplay = formatHours(totalMinutes);
    const remainingHours = calculateRemainingHours(totalMinutes, requiredMinutes);

    // Obsługa dodawania sesji
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
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Poczekaj chwilę aby React zaktualizował stan
            await new Promise(resolve => setTimeout(resolve, 100));

            setIsModalVisible(false);
            setHours(0);
            setMinutes(0);

            // Wymuś odświeżenie po zamknięciu modalu
            setTimeout(() => {
                setRefreshKey(prev => prev + 1);
            }, 100);
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
            {/* Przycisk ustawień */}
            <SettingsButton onPress={settings.open} isDark={settings.isDark} />

            {/* Nazwa kategorii */}
            <Text style={{
                color: colors.text,
                fontSize: 36,
                fontWeight: 'bold',
                marginBottom: 24,
                marginTop: 4
            }}>
                Kategoria {selectedCategory?.name || 'B'}
            </Text>

            {/* Nagłówek */}
            <Text style={{
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 20,
                fontWeight: '500'
            }}>
                Twój Postęp
            </Text>

            {/* Wykres kołowy postępu */}
            <ProgressCircle progress={progress} label={`${hoursDisplay}h`} isDark={settings.isDark} />

            {/* Informacje i akcje */}
            <View style={{ marginTop: 48, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, marginBottom: 24, fontWeight: '500' }}>
                    Do egzaminu: {remainingHours} h
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
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Dodaj jazdę</Text>
                </TouchableOpacity>
            </View>

            {/* Modal dodawania sesji */}
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