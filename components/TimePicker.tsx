import React, { useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { getColors } from '@/utils';

interface Props {
    hours: number;
    minutes: number;
    setHours: (v: number) => void;
    setMinutes: (v: number) => void;
    maxHours?: number;
    isDark?: boolean;
}

const ITEM_HEIGHT = 40;

export default function TimePicker({
    hours,
    minutes,
    setHours,
    setMinutes,
    maxHours = 30,
    isDark = false,
}: Props) {
    const { t } = useTranslation();
    const colors = getColors(isDark);
    const hoursScrollRef = useRef<ScrollView>(null);
    const minutesScrollRef = useRef<ScrollView>(null);
    const lastHourRef = useRef<number>(hours);
    const lastMinuteRef = useRef<number>(minutes);

    // Scroll to initial values on mount
    useEffect(() => {
        setTimeout(() => {
            hoursScrollRef.current?.scrollTo({ y: hours * ITEM_HEIGHT, animated: false });
            minutesScrollRef.current?.scrollTo({ y: minutes * ITEM_HEIGHT, animated: false });
        }, 100);
    }, [hours, minutes]);

    const handleHoursScroll = (event: any) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        const index = Math.round(yOffset / ITEM_HEIGHT);
        if (index >= 0 && index <= maxHours && index !== lastHourRef.current) {
            lastHourRef.current = index;
            void Haptics.selectionAsync();
        }
    };

    const handleHoursScrollEnd = (event: any) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        const index = Math.round(yOffset / ITEM_HEIGHT);
        if (index >= 0 && index <= maxHours && index !== hours) {
            setHours(index);
        }
    };

    const handleMinutesScroll = (event: any) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        const index = Math.round(yOffset / ITEM_HEIGHT);
        if (index >= 0 && index < 60 && index !== lastMinuteRef.current) {
            lastMinuteRef.current = index;
            void Haptics.selectionAsync();
        }
    };

    const handleMinutesScrollEnd = (event: any) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        const index = Math.round(yOffset / ITEM_HEIGHT);
        if (index >= 0 && index < 60 && index !== minutes) {
            setMinutes(index);
        }
    };

    const scrollToHour = (value: number) => {
        void Haptics.selectionAsync();
        setHours(value);
        hoursScrollRef.current?.scrollTo({ y: value * ITEM_HEIGHT, animated: true });
    };

    const scrollToMinute = (value: number) => {
        void Haptics.selectionAsync();
        setMinutes(value);
        minutesScrollRef.current?.scrollTo({ y: value * ITEM_HEIGHT, animated: true });
    };

    const renderPickerColumn = (
        value: number,
        maxValue: number,
        scrollRef: React.RefObject<ScrollView | null>,
        onScroll: (e: any) => void,
        onScrollEnd: (e: any) => void,
        onPress: (v: number) => void,
        label: string
    ) => (
        <View style={{ alignItems: 'center' }}>
            <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                marginBottom: 8,
                color: colors.text,
                fontSize: 12
            }}>
                {label}
            </Text>
            <View style={{
                height: ITEM_HEIGHT * 3,
                width: 80,
                overflow: 'hidden',
                borderRadius: 12,
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderWidth: 2,
                borderColor: isDark ? '#374151' : '#e5e7eb',
            }}>
                {/* Selector overlay */}
                <View style={{
                    position: 'absolute',
                    top: ITEM_HEIGHT,
                    left: 0,
                    right: 0,
                    height: ITEM_HEIGHT,
                    backgroundColor: isDark ? '#3b82f630' : colors.primary + '15',
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: isDark ? '#3b82f6' : colors.primary,
                    zIndex: 1,
                    pointerEvents: 'none'
                }} />

                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onScroll={onScroll}
                    onMomentumScrollEnd={onScrollEnd}
                    scrollEventThrottle={16}
                    contentContainerStyle={{
                        paddingVertical: ITEM_HEIGHT
                    }}
                >
                    {Array.from({ length: maxValue + 1 }, (_, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => onPress(i)}
                            style={{
                                height: ITEM_HEIGHT,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{
                                fontSize: 20,
                                fontWeight: value === i ? '800' : '400',
                                color: value === i ? (isDark ? '#60a5fa' : colors.primary) : colors.text,
                                opacity: value === i ? 1 : 0.4
                            }}>
                                {i}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
            paddingVertical: 8
        }}>
            {renderPickerColumn(hours, maxHours, hoursScrollRef, handleHoursScroll, handleHoursScrollEnd, scrollToHour, t('modal.hours'))}
            {renderPickerColumn(minutes, 59, minutesScrollRef, handleMinutesScroll, handleMinutesScrollEnd, scrollToMinute, t('modal.minutes'))}
        </View>
    );
}
