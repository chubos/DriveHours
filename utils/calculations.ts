/**
 * Helper functions for driving-session related calculations
 */

import { DrivingSession, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

export const normalizeCategory = (id?: string | null) => id ?? DEFAULT_CATEGORIES[0]?.id ?? 'B';

export const calculateTotalMinutes = (
    sessions: DrivingSession[],
    categoryId?: string | null
): number => {
    const target = normalizeCategory(categoryId);
    return sessions
        .filter(s => normalizeCategory(s.categoryId) === target)
        .reduce((sum, s) => sum + s.durationMinutes, 0);
};

/**
 * Calculates progress (0-1) relative to required minutes
 */
export const calculateProgress = (
    totalMinutes: number,
    requiredMinutes: number
): number => {
    if (requiredMinutes <= 0) return 0;
    return Math.min(totalMinutes / requiredMinutes, 1);
};

/**
 * Converts minutes to the "X.X h" format
 */
export const formatHours = (minutes: number): string => {
    return (minutes / 60).toFixed(1);
};

/**
 * Formats a timestamp to local date format
 */
export const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('pl-PL');
};

/**
 * Converts a YYYY-MM-DD date string to a timestamp
 */
export const dateStringToTimestamp = (dateString: string): number => {
    // Use local date (not UTC) to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).getTime();
};

/**
 * Calculates remaining hours until completion
 */
export const calculateRemainingHours = (
    totalMinutes: number,
    requiredMinutes: number
): string => {
    const remaining = Math.max((requiredMinutes - totalMinutes) / 60, 0);
    return remaining.toFixed(1);
};

/**
 * Returns the selected category from the categories list
 */
export const getSelectedCategory = (
    categories: Category[],
    selectedCategoryId?: string | null
): Category | undefined => {
    const target = normalizeCategory(selectedCategoryId);
    return categories.find(c => c.id === target) ?? categories[0];
};

/**
 * Creates a new driving session
 */
export const createDrivingSession = (
    hours: number,
    minutes: number,
    categoryId?: string | null,
    customDate?: Date
): DrivingSession => {
    const sessionDate = customDate || new Date();
    const timestamp = sessionDate.getTime();

    const year = sessionDate.getFullYear();
    const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
    const day = String(sessionDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    return {
        id: Date.now().toString(),
        date: dateString,
        timestamp,
        durationMinutes: hours * 60 + minutes,
        categoryId: normalizeCategory(categoryId),
    };
};

/**
 * Calculates completion prediction based on current pace
 * Returns null when there isn't enough data, 'completed' when finished, or a date string
 */
export const calculatePrediction = (
    sessions: DrivingSession[],
    totalMinutes: number,
    requiredMinutes: number
): string | null => {
    if (sessions.length < 2) return null;
    if (totalMinutes >= requiredMinutes) return 'completed';

    const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
    const firstDate = sorted[0].timestamp;
    const lastDate = Date.now();
    const daysElapsed = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

    const effectiveDays = daysElapsed < 1 ? 1 : daysElapsed;
    const minPerDay = totalMinutes / effectiveDays;

    // Prevent division by zero or unrealistic predictions
    if (minPerDay <= 0) return null;

    const remainingMin = requiredMinutes - totalMinutes;
    const daysLeft = Math.ceil(remainingMin / minPerDay);

    // Prevent unrealistic predictions (more than 3 years)
    if (daysLeft > 1095) return null;

    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + daysLeft);

    return finishDate.toLocaleDateString();
};

/**
 * Returns weekly chart data for the last 7 days
 */
export const getWeeklyChartData = (sessions: DrivingSession[], t?: (key: string) => string) => {
    const days = t ? [
        t('days.short.sun'),
        t('days.short.mon'),
        t('days.short.tue'),
        t('days.short.wed'),
        t('days.short.thu'),
        t('days.short.fri'),
        t('days.short.sat')
    ] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Prepare an array for the last 7 days
    const last7Days: { label: string; value: number; date: string }[] = [];
    const today = new Date();

    // Iterate from 6 to 0 so the days go from oldest to newest (today last)
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const dayOfWeek = date.getDay();

        // Use local date (not UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        last7Days.push({
            label: days[dayOfWeek],
            value: 0,
            date: dateString
        });
    }

    // Sum minutes for each day
    sessions.forEach(s => {
        const sessionDate = s.date; // Format: YYYY-MM-DD
        const dayData = last7Days.find(d => d.date === sessionDate);
        if (dayData) {
            dayData.value += s.durationMinutes;
        }
    });

    // Calculate bar heights
    const values = last7Days.map(d => d.value);

    // Safely calculate max value
    let maxVal = 60; // Default minimum
    if (values.length > 0) {
        const arrayMax = Math.max(...values);
        maxVal = Math.max(arrayMax, 60);
    }

    const chartHeightPx = 128;

    return last7Days.map(day => {
        const heightPercent = maxVal > 0 ? (day.value / maxVal) * 100 : 0;
        const heightPx = Math.max((heightPercent / 100) * chartHeightPx, 4);
        return {
            label: day.label,
            value: day.value,
            heightPx
        };
    });
};
