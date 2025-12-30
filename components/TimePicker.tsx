import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getColors } from '../utils/colors';

interface Props {
    hours: number;
    minutes: number;
    setHours: (v: number) => void;
    setMinutes: (v: number) => void;
    maxHours?: number;
    isDark?: boolean;
}

export default function TimePicker({
    hours,
    minutes,
    setHours,
    setMinutes,
    maxHours = 30,
    isDark = false,
}: Props) {
    const colors = getColors(isDark);

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <View>
                <Text style={{ textAlign: 'center', fontWeight: '600', marginBottom: 4, color: colors.text }}>Godziny</Text>
                <Picker
                    selectedValue={hours}
                    onValueChange={(value) => setHours(Number(value))}
                    style={{ width: 100 }}
                    itemStyle={{ color: colors.text }}
                >
                    {Array.from({ length: maxHours + 1 }, (_, i) => (
                        <Picker.Item key={i} label={`${i}`} value={i} color={colors.text} />
                    ))}
                </Picker>
            </View>

            <View>
                <Text style={{ textAlign: 'center', fontWeight: '600', marginBottom: 4, color: colors.text }}>Minuty</Text>
                <Picker
                    selectedValue={minutes}
                    onValueChange={(value) => setMinutes(Number(value))}
                    style={{ width: 100 }}
                    itemStyle={{ color: colors.text }}
                >
                    {Array.from({ length: 60 }, (_, i) => (
                        <Picker.Item key={i} label={`${i}`} value={i} color={colors.text} />
                    ))}
                </Picker>
            </View>
        </View>
    );
}
