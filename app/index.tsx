import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

import ProgressCircle from "../components/ProgressCircle";
import TimePicker from "../components/TimePicker";

const REQUIRED_MINUTES = 30 * 60; // 30 godzin

export default function IndexPage() {
    const [minutes, setMinutes] = useState(0);
    const [modal, setModal] = useState(false);

    const [addH, setAddH] = useState(0);
    const [addM, setAddM] = useState(0);

    // Load from storage
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem("minutes");
            if (saved) setMinutes(Number(saved));
        })();
    }, []);

    // Auto save
    useEffect(() => {
        AsyncStorage.setItem("minutes", String(minutes));
    }, [minutes]);

    const addTime = () => {
        const total = addH * 60 + addM;
        if (!total) return;

        setMinutes((prev) => prev + total);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setModal(false);
        setAddH(0);
        setAddM(0);
    };

    const reset = () => {
        setMinutes(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };

    const progress = Math.min(minutes / REQUIRED_MINUTES, 1);
    const hoursDisplay = (minutes / 60).toFixed(1);

    return (
        <View className="flex-1 items-center justify-center bg-white p-6">

            <ProgressCircle progress={progress} label={`${hoursDisplay} h`} />

            <TouchableOpacity
                onPress={() => setModal(true)}
                className="bg-blue-600 px-6 py-3 rounded-xl mt-10"
            >
                <Text className="text-lg text-white font-semibold">Dodaj jazdę</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={reset}
                className="bg-red-500 px-6 py-3 rounded-xl mt-4"
            >
                <Text className="text-lg text-white font-semibold">Reset</Text>
            </TouchableOpacity>

            {/* Modal z pickerem */}
            <Modal visible={modal} transparent animationType="slide">
                <View className="flex-1 justify-center items-center bg-black/40">
                    <View className="bg-white p-6 rounded-2xl w-80">
                        <Text className="text-xl font-bold text-center mb-4">
                            Dodaj czas jazdy
                        </Text>

                        <TimePicker
                            hours={addH}
                            minutes={addM}
                            setHours={setAddH}
                            setMinutes={setAddM}
                        />

                        <TouchableOpacity
                            onPress={addTime}
                            className="bg-green-600 px-4 py-3 rounded-xl mt-4"
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Zapisz
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="mt-3"
                            onPress={() => setModal(false)}
                        >
                            <Text className="text-center text-gray-600">Anuluj</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
