/**
 * Light and dark theme colors
 */

export const colors = {
    light: {
        background: '#f8fafc',
        surface: '#ffffff',
        surfaceElevated: '#ffffff',
        text: '#1f2937',
        textSecondary: '#6b7280',
        textTertiary: '#9ca3af',
        border: '#e5e7eb',
        primary: '#3b82f6',
        primaryLight: '#eff6ff',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        chart: '#93c5fd',
    },
    dark: {
        background: '#0f172a',
        surface: '#1e293b',
        surfaceElevated: '#334155',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        textTertiary: '#64748b',
        border: '#334155',
        primary: '#3b82f6',
        primaryLight: '#1e3a8a',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        chart: '#60a5fa',
    },
};

export type ColorScheme = typeof colors.light;

export const getColors = (isDark: boolean): ColorScheme => {
    return isDark ? colors.dark : colors.light;
};
