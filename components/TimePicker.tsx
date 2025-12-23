import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface Props {
    hours: number;
    minutes: number;
    setHours: (v: number) => void;
    setMinutes: (v: number) => void;
}

export default function TimePicker({
                                       hours,
                                       minutes,
                                       setHours,
                                       setMinutes,
                                   }: Props) {
    return (
        <View className="flex-row justify-center items-center gap-4">
            <View>
                <Text className="text-center font-semibold mb-1">Godziny</Text>
                <Picker
                    selectedValue={hours}
                    onValueChange={setHours}
                    style={{ width: 100 }}
                >
                    {Array.from({ length: 30 }, (_, i) => (
                        <Picker.Item key={i} label={`${i}`} value={i} />
                    ))}
                </Picker>
            </View>

            <View>
                <Text className="text-center font-semibold mb-1">Minuty</Text>
                <Picker
                    selectedValue={minutes}
                    onValueChange={setMinutes}
                    style={{ width: 100 }}
                >
                    {Array.from({ length: 60 }, (_, i) => (
                        <Picker.Item key={i} label={`${i}`} value={i} />
                    ))}
                </Picker>
            </View>
        </View>
    );
}
