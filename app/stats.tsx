/**
 * Strona statystyk - wyświetla analitykę i osiągnięcia
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { SettingsButton } from '../components/SettingsButton';
import { WeeklyChart } from '../components/WeeklyChart';
import { Badge } from '../components/Badge';
import { useSettings } from '../components/SettingsDrawer';
import { useDrivingSessions } from '../hooks';
import { getColors } from '../utils/colors';
import {
    calculateTotalMinutes,
    calculatePrediction,
    getWeeklyChartData,
    getSelectedCategory,
} from '../utils/calculations';

export default function StatsPage() {
    // Hooks
    const settings = useSettings();
    const { sessions } = useDrivingSessions();
    const [refreshKey, setRefreshKey] = useState(0);
    const colors = getColors(settings.isDark);

    // Odśwież dane gdy wracamy do ekranu
    useFocusEffect(
        useCallback(() => {
            setRefreshKey(prev => prev + 1);
        }, [sessions, settings.selectedCategoryId])
    );

    // Filtrowanie sesji dla wybranej kategorii
    const filteredSessions = sessions.filter(
        s => s.categoryId === settings.selectedCategoryId
    );

    // Obliczenia
    const totalMinutes = calculateTotalMinutes(sessions, settings.selectedCategoryId);
    const averageDuration =
        filteredSessions.length > 0
            ? (totalMinutes / filteredSessions.length).toFixed(0)
            : '0';

    const selectedCategory = getSelectedCategory(
        settings.categories,
        settings.selectedCategoryId
    );
    const requiredMinutes = selectedCategory?.requiredMinutes ?? 30 * 60;

    const prediction = calculatePrediction(
        filteredSessions,
        totalMinutes,
        requiredMinutes
    );

    const weeklyData = getWeeklyChartData(filteredSessions);

    // Dane dla osiągnięć
    const achievements = [
        {
            active: totalMinutes >= 60,
            label: 'Pierwsza godzina',
            iconName: 'leaf-outline' as const,
            color: '#10b981',
        },
        {
            active: totalMinutes >= requiredMinutes / 2,
            label: `Półmetek (${(requiredMinutes / 120).toFixed(0)}h)`,
            iconName: 'flash-outline' as const,
            color: '#f59e0b',
        },
        {
            active: totalMinutes >= requiredMinutes,
            label: `Mistrz (${(requiredMinutes / 60).toFixed(0)}h)`,
            iconName: 'trophy-outline' as const,
            color: '#eab308',
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Przycisk ustawień */}
            <SettingsButton onPress={settings.open} isDark={settings.isDark} />

            <ScrollView key={refreshKey}>
                <View style={{ padding: 24, paddingTop: 64 }}>
                    {/* Nazwa kategorii */}
                    <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                        Kategoria {selectedCategory?.name || 'B'}
                    </Text>

                    {/* Nagłówek */}
                    <Text style={{ fontSize: 30, fontWeight: '900', marginBottom: 32, color: colors.text }}>
                        Analityka
                    </Text>

                    {/* Wykres tygodniowy */}
                    <WeeklyChart data={weeklyData} isDark={settings.isDark} />

                {/* Podsumowanie ilościowe */}
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
                    {/* Średnia sesja */}
                    <View style={{
                        flex: 1,
                        backgroundColor: colors.surface,
                        padding: 20,
                        borderRadius: 30,
                        shadowColor: '#000',
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        borderWidth: 1,
                        borderColor: colors.border
                    }}>
                        <Text style={{ color: colors.textTertiary, fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 }}>
                            Średnia sesja
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>
                            {averageDuration} min
                        </Text>
                    </View>

                    {/* Prognoza końca */}
                    <View style={{
                        flex: 1,
                        backgroundColor: colors.primary,
                        padding: 20,
                        borderRadius: 30,
                        shadowColor: '#000',
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8
                    }}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 }}>
                            Prognoza końca
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>
                            {prediction}
                        </Text>
                    </View>
                </View>

                {/* Sekcja osiągnięć */}
                <Text style={{ fontSize: 20, fontWeight: '900', marginBottom: 16, color: colors.text, marginLeft: 4 }}>
                    Osiągnięcia
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {achievements.map((achievement, index) => (
                        <Badge
                            key={index}
                            active={achievement.active}
                            label={achievement.label}
                            iconName={achievement.iconName}
                            color={achievement.color}
                            isDark={settings.isDark}
                        />
                    ))}
                </View>

                {/* Margines dolny dla paska nawigacji */}
                <View style={{ height: 128 }} />
            </View>
        </ScrollView>
        </View>
    );
}
