/**
 * RTL (Right-to-Left) utilities and hooks
 */

import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

/**
 * Hook to get current RTL state
 */
export function useRTL() {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar' || i18n.language === 'he';

    return {
        isRTL,
        language: i18n.language,
    };
}

/**
 * Hook to automatically configure RTL layout based on language
 */
export function useRTLConfig() {
    const { i18n } = useTranslation();

    useEffect(() => {
        const isRTL = i18n.language === 'ar' || i18n.language === 'he';
        if (I18nManager.isRTL !== isRTL) {
            I18nManager.forceRTL(isRTL);
            I18nManager.allowRTL(isRTL);
        }
    }, [i18n.language]);
}

/**
 * Get RTL-aware flex direction
 */
export function getFlexDirection(isRTL: boolean): 'row' | 'row-reverse' {
    return isRTL ? 'row-reverse' : 'row';
}

/**
 * Get RTL-aware text alignment
 */
export function getTextAlign(isRTL: boolean): 'left' | 'right' {
    return isRTL ? 'right' : 'left';
}

/**
 * Get RTL-aware margin/padding
 */
export function getRTLStyle(isRTL: boolean, leftValue: number, rightValue: number) {
    return isRTL
        ? { marginRight: leftValue, marginLeft: rightValue }
        : { marginLeft: leftValue, marginRight: rightValue };
}

