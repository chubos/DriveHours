/**
 * Statistics screen – shows analytics and achievements
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { SettingsButton, WeeklyChart, Badge, useSettings } from '@/components';
import { useDrivingSessions } from '@/hooks';
import {
    getColors,
    calculateTotalMinutes,
    calculatePrediction,
    getWeeklyChartData,
    getSelectedCategory,
} from '@/utils';

export default function StatsPage() {
    // Hooks
    const { t } = useTranslation();
    const settings = useSettings();
    const { sessions } = useDrivingSessions();
    const [refreshKey, setRefreshKey] = useState(0);
    const colors = getColors(settings.isDark);

    // Refresh data when returning to this screen
    useFocusEffect(
        useCallback(() => {
            setRefreshKey(prev => prev + 1);
        }, [])
    );

    // Filter sessions for the selected category
    const filteredSessions = sessions.filter(
        s => s.categoryId === settings.selectedCategoryId
    );

    // Calculations
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

    // Format prediction using translations
    const predictionText =
        prediction === null ? t('stats.collectingData') :
        prediction === 'completed' ? t('stats.completed') :
        prediction;

    const weeklyData = getWeeklyChartData(filteredSessions, (key: string) => t(key as any));

    // Achievements data
    const achievements = [
        {
            active: totalMinutes >= 60,
            label: t('stats.firstHour'),
            iconName: 'leaf-outline' as const,
            color: '#10b981',
        },
        {
            active: totalMinutes >= requiredMinutes / 2,
            label: `${t('stats.halfway')} (${(requiredMinutes / 120).toFixed(0)}h)`,
            iconName: 'flash-outline' as const,
            color: '#f59e0b',
        },
        {
            active: totalMinutes >= requiredMinutes,
            label: `${t('stats.master')} (${(requiredMinutes / 60).toFixed(0)}h)`,
            iconName: 'trophy-outline' as const,
            color: '#eab308',
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Settings button - rendered with proper layering for touch events */}
            <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
                <SettingsButton onPress={settings.open} isDark={settings.isDark} />
            </View>

            <ScrollView key={refreshKey} contentContainerStyle={{ alignItems: 'center' }}>
                <View style={{ padding: 24, paddingTop: 64, maxWidth: 800, width: '100%' }}>
                    {/* Category name */}
                    <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                        {t('stats.category')} {selectedCategory?.name || 'B'}
                    </Text>

                    {/* Header */}
                    <Text style={{ fontSize: 30, fontWeight: '900', marginBottom: 32, color: colors.text }}>
                        {t('stats.title')}
                    </Text>

                    {/* Weekly chart */}
                    <WeeklyChart data={weeklyData} isDark={settings.isDark} />

                {/* Summary */}
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
                    {/* Average session */}
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
                            {t('stats.averageDuration')}
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>
                            {averageDuration} {t('stats.minutes')}
                        </Text>
                    </View>

                    {/* Completion prediction */}
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
                            {t('stats.daysLeft')}
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>
                            {predictionText}
                        </Text>
                    </View>
                </View>

                {/* Achievements section */}
                <Text style={{ fontSize: 20, fontWeight: '900', marginBottom: 16, color: colors.text, marginLeft: 4 }}>
                    {t('stats.achievements')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
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

                {/* Bottom margin for navigation bar */}
                <View style={{ height: 128 }} />
            </View>
        </ScrollView>
        </View>
    );
}
