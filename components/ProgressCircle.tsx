import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface Props {
    progress: number;
    label: string;
    isDark?: boolean;
}

export default function ProgressCircle({ progress, label, isDark = false }: Props) {
    const size = 260; // Nieco większe
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference * (1 - progress);

    const bgColor = isDark ? '#334155' : '#f1f5f9';
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const subTextColor = isDark ? '#94a3b8' : '#94a3b8';

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 }}>
            <Svg width={size} height={size}>
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#3b82f6" />
                        <Stop offset="100%" stopColor="#2dd4bf" />
                    </LinearGradient>
                </Defs>
                <Circle
                    stroke={bgColor}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <Circle
                    stroke="url(#grad)"
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
            <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Text style={{ fontSize: 48, fontWeight: '900', color: textColor }}>{label}</Text>
                <Text style={{ color: subTextColor, fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, letterSpacing: -0.5 }}>ukończono</Text>
            </View>
        </View>
    );
}