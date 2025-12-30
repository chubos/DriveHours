/**
 * Komponent wykresu tygodniowego intensywności jazdy
 */

import React from 'react';
import { View, Text } from 'react-native';
import { getColors } from '../utils/colors';

interface WeeklyChartData {
    label: string;
    value: number;
    heightPx: number;
}

interface WeeklyChartProps {
    data: WeeklyChartData[];
    isDark?: boolean;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data, isDark = false }) => {
    const colors = getColors(isDark);

    return (
        <View style={{
            backgroundColor: colors.surface,
            padding: 24,
            borderRadius: 35,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border
        }}>
            <Text style={{
                color: colors.textTertiary,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: 10,
                marginBottom: 16,
                letterSpacing: 1.5
            }}>
                Intensywność (minuty/dzień)
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    paddingHorizontal: 8,
                    height: 152
                }}
            >
                {data.map((day, idx) => (
                    <View
                        key={idx}
                        style={{ alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}
                    >
                        <View
                            style={{
                                height: day.heightPx,
                                minHeight: 4,
                                width: 12,
                                borderRadius: 999,
                                backgroundColor: day.value > 0 ? colors.chart : colors.border
                            }}
                        />
                        <Text style={{ fontSize: 10, color: colors.textTertiary, marginTop: 8, fontWeight: 'bold' }}>
                            {day.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

