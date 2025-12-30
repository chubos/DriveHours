/**
 * Funkcje pomocnicze do obliczeń związanych z sesjami jazdy
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
 * Oblicza progres (0-1) w stosunku do wymaganych godzin
 */
export const calculateProgress = (
    totalMinutes: number,
    requiredMinutes: number
): number => {
    return Math.min(totalMinutes / requiredMinutes, 1);
};

/**
 * Konwertuje minuty na format "X.X h"
 */
export const formatHours = (minutes: number): string => {
    return (minutes / 60).toFixed(1);
};

/**
 * Formatuje timestamp na lokalny format daty
 */
export const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('pl-PL');
};

/**
 * Konwertuje datę YYYY-MM-DD na timestamp
 */
export const dateStringToTimestamp = (dateString: string): number => {
    // Używamy lokalnej daty zamiast UTC aby uniknąć problemu z timezone
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).getTime();
};

/**
 * Oblicza pozostałe godziny do ukończenia
 */
export const calculateRemainingHours = (
    totalMinutes: number,
    requiredMinutes: number
): string => {
    const remaining = Math.max((requiredMinutes - totalMinutes) / 60, 0);
    return remaining.toFixed(1);
};

/**
 * Pobiera wybraną kategorię z listy kategorii
 */
export const getSelectedCategory = (
    categories: Category[],
    selectedCategoryId?: string | null
): Category | undefined => {
    const target = normalizeCategory(selectedCategoryId);
    return categories.find(c => c.id === target) ?? categories[0];
};

/**
 * Tworzy nową sesję jazdy
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
 * Oblicza prognozę ukończenia na podstawie dotychczasowego tempa
 */
export const calculatePrediction = (
    sessions: DrivingSession[],
    totalMinutes: number,
    requiredMinutes: number
): string => {
    if (sessions.length < 2) return "Zbieranie danych...";
    if (totalMinutes >= requiredMinutes) return "Ukończono!";

    const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
    const firstDate = sorted[0].timestamp;
    const lastDate = Date.now();
    const daysElapsed = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

    const effectiveDays = daysElapsed < 1 ? 1 : daysElapsed;
    const minPerDay = totalMinutes / effectiveDays;
    const remainingMin = requiredMinutes - totalMinutes;

    const daysLeft = Math.ceil(remainingMin / (minPerDay || 1));
    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + daysLeft);

    return finishDate.toLocaleDateString('pl-PL');
};

/**
 * Pobiera dane tygodniowe do wykresu - ostatnie 7 dni
 */
export const getWeeklyChartData = (sessions: DrivingSession[]) => {
    const days = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'];

    // Przygotuj tablicę dla ostatnich 7 dni
    const last7Days: { label: string; value: number; date: string }[] = [];
    const today = new Date();

    // Iterujemy od 0 do 6 aby mieć dni od najstarszego do najnowszego (dzisiaj ostatni)
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const dayOfWeek = date.getDay();

        // Używamy lokalnej daty zamiast UTC
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

    // Sumuj minuty dla każdego dnia
    sessions.forEach(s => {
        const sessionDate = s.date; // Format YYYY-MM-DD
        const dayData = last7Days.find(d => d.date === sessionDate);
        if (dayData) {
            dayData.value += s.durationMinutes;
        }
    });

    // Oblicz wysokości słupków
    const values = last7Days.map(d => d.value);
    const maxVal = Math.max(...values, 60);
    const chartHeightPx = 128;

    return last7Days.map(day => {
        const heightPercent = (day.value / maxVal) * 100;
        const heightPx = Math.max((heightPercent / 100) * chartHeightPx, 4);
        return {
            label: day.label,
            value: day.value,
            heightPx
        };
    });
};
