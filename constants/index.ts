/**
 * App-wide configuration constants
 */

// AsyncStorage keys
export const STORAGE_KEYS = {
    DRIVING_SESSIONS: 'driving_sessions',
    CATEGORIES: 'drive_categories_v1',
    SELECTED_CATEGORY: 'drive_selected_category_v1',
    THEME_MODE: 'theme_mode',
} as const;

// Default driving license categories
export const DEFAULT_CATEGORIES = [
    { id: 'B', name: 'B', requiredMinutes: 30 * 60 },
];

// Animation parameters
export const ANIMATION_DURATION = {
    DRAWER: 250,
    GESTURE: 200,
} as const;

// Gesture parameters
export const GESTURE_CONFIG = {
    EDGE_DETECTION_WIDTH: 50,
    SWIPE_THRESHOLD: 80,
    ANIMATION_DISTANCE: 200,
    DISMISS_THRESHOLD: -50,
} as const;

// UI dimensions
export const UI_DIMENSIONS = {
    DRAWER_MAX_WIDTH: 360,
    DRAWER_WIDTH_PERCENT: 0.9,
    TAB_BAR_HEIGHT: 90,
} as const;

// Colors
export const COLORS = {
    PRIMARY: '#3b82f6',
    SECONDARY: '#2dd4bf',
    DANGER: '#ef4444',
    TEXT_PRIMARY: '#1f2937',
    TEXT_SECONDARY: '#6b7280',
    TEXT_TERTIARY: '#9ca3af',
    BACKGROUND: '#f8fafc',
    SURFACE: '#ffffff',
    BORDER: '#e5e7eb',
} as const;
