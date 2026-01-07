/**
 * Shared types for the DriveHours app
 */

export interface DrivingSession {
    id: string;
    date: string; // Format: YYYY-MM-DD (for calendar/date picker)
    timestamp: number; // Unix timestamp in milliseconds
    durationMinutes: number;
    categoryId?: string;
}

export interface Category {
    id: string;
    name: string;
    requiredMinutes: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface SettingsContextValue {
    open: () => void;
    close: () => void;
    isOpen: boolean;
    categories: Category[];
    selectedCategoryId?: string | null;
    setSelectedCategoryId: (id: string) => void;
    addCategory: (c: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, patch: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
}
