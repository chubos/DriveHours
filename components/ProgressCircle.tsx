import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Props {
    progress: number; // value 0..1
    label: string;
}

export default function ProgressCircle({ progress, label }: Props) {
    const size = 220;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View className="items-center justify-center">
            <Svg width={size} height={size}>
                {/* Tło koła */}
                <Circle
                    stroke="#e5e7eb"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />

                {/* Postęp */}
                <Circle
                    stroke="#3b82f6"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    originX={size / 2}
                    originY={size / 2}
                />
            </Svg>

            <View className="absolute items-center justify-center">
                <Text className="text-4xl font-bold">{label}</Text>
            </View>
        </View>
    );
}
