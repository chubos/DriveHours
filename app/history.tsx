/**
 * Strona historii jazd - wyświetla listę sesji jazdy z możliwością edycji
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

import TimePicker from '../components/TimePicker';
import { SettingsButton } from '../components/SettingsButton';
import { useSettings } from '../components/SettingsDrawer';
import { useDrivingSessions } from '../hooks';
import { DrivingSession } from '../types';
import { formatHours, formatDate, dateStringToTimestamp, getSelectedCategory } from '../utils/calculations';
import { getColors } from '../utils/colors';


export default function HistoryPage() {
    // Hooks
    const settings = useSettings();
    const { sessions, updateSession, deleteSession } = useDrivingSessions();
    const colors = getColors(settings.isDark);

    console.log('📋 HISTORY - Liczba sesji:', sessions.length);

    // Stan lokalny
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedSession, setSelectedSession] = useState<DrivingSession | null>(null);
    const [editDate, setEditDate] = useState('');
    const [editHours, setEditHours] = useState(0);
    const [editMinutes, setEditMinutes] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Oblicz maxHours dla wybranej kategorii
    const selectedCategory = getSelectedCategory(
        settings.categories,
        settings.selectedCategoryId
    );
    const maxHours = Math.ceil((selectedCategory?.requiredMinutes ?? 30 * 60) / 60);

    // Wymuszenie odświeżenia gdy wracamy do ekranu
    useFocusEffect(
        useCallback(() => {
            setRefreshCounter(prev => prev + 1);
        }, [sessions, settings.selectedCategoryId])
    );

    // Zamknij modal gdy sesja jest zaktualizowana
    useEffect(() => {
        if (isSaving && selectedSession) {
            const expectedDuration = editHours * 60 + editMinutes;
            const updatedSession = sessions.find(s => s.id === selectedSession.id);

            if (updatedSession && updatedSession.durationMinutes === expectedDuration) {
                setIsEditModalVisible(false);
                setShowDatePicker(false);
                setSelectedSession(null);
                setIsSaving(false);
                setRefreshCounter(prev => prev + 1);
            }
        }
    }, [sessions, isSaving, selectedSession, editHours, editMinutes]);

    // Filtrowanie i sortowanie sesji
    const filteredSessions = sessions
        .filter(s => s.categoryId === settings.selectedCategoryId)
        .sort((a, b) => b.timestamp - a.timestamp);

    // Obsługa otwierania edycji
    const handleOpenEdit = (session: DrivingSession) => {
        setSelectedSession(session);
        setEditDate(session.date);
        setTempDate(new Date(session.timestamp));
        setEditHours(Math.floor(session.durationMinutes / 60));
        setEditMinutes(session.durationMinutes % 60);
        setIsEditModalVisible(true);
        setShowDatePicker(false); // Nie pokazuj pickera od razu
    };

    // Obsługa zmiany daty
    const onDateChange = (event: any, selectedDate?: Date) => {
        // Na Androidzie gdy użytkownik anuluje, zamknij picker
        if (Platform.OS === 'android' && event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }

        // Aktualizuj datę bez zamykania pickera
        if (selectedDate) {
            setTempDate(selectedDate);

            // Używamy lokalnej daty bez konwersji UTC aby uniknąć problemu z timezone
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            setEditDate(dateString);
        }
    };

    // Obsługa zapisywania edycji
    const handleSaveEdit = async () => {
        if (!selectedSession) return;

        const timestamp = dateStringToTimestamp(editDate);
        const newDurationMinutes = editHours * 60 + editMinutes;

        setIsSaving(true);

        const success = await updateSession(selectedSession.id, {
            date: editDate,
            timestamp,
            durationMinutes: newDurationMinutes,
        });

        if (!success) {
            setIsSaving(false);
            Alert.alert('Błąd', 'Nie udało się zapisać zmian');
        }
        // Jeśli success=true, useEffect zamknie modal gdy dane będą zaktualizowane
    };

    // Obsługa usuwania sesji
    const handleDeleteSession = () => {
        if (!selectedSession) return;

        Alert.alert(
            'Usuń sesję',
            'Czy na pewno chcesz usunąć tę sesję?',
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Usuń',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteSession(selectedSession.id);
                        setIsEditModalVisible(false);
                        setSelectedSession(null);
                    },
                },
            ]
        );
    };

    // Renderowanie pojedynczej sesji
    const renderSession = ({ item }: { item: DrivingSession }) => (
        <TouchableOpacity
            onPress={() => handleOpenEdit(item)}
            style={{
                backgroundColor: colors.surface,
                padding: 20,
                borderRadius: 24,
                marginBottom: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                borderWidth: 1,
                borderColor: colors.border
            }}
        >
            <View>
                <Text style={{ color: colors.textTertiary, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>Data</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>{formatDate(item.timestamp)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textTertiary, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>Czas</Text>
                <Text style={{ fontSize: 20, fontWeight: '900', color: colors.primary }}>
                    {formatHours(item.durationMinutes)} h
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Przycisk ustawień */}
            <SettingsButton onPress={settings.open} isDark={settings.isDark} />

            <View style={{ flex: 1, padding: 24, paddingTop: 64 }}>
                {/* Nazwa kategorii */}
                <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                    Kategoria {selectedCategory?.name || 'B'}
                </Text>

                {/* Nagłówek */}
                <Text style={{ fontSize: 30, fontWeight: '900', marginBottom: 24, color: colors.text }}>Historia</Text>

                {/* Lista sesji lub komunikat o braku danych */}
                {filteredSessions.length === 0 ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: colors.textTertiary, fontSize: 18 }}>Brak historii jazd</Text>
                    </View>
                ) : (
                    <FlatList
                        key={refreshCounter}
                        data={filteredSessions}
                        keyExtractor={item => item.id}
                        renderItem={renderSession}
                        extraData={sessions}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    />
                )}
            </View>

            {/* Modal edycji sesji */}
            <Modal visible={isEditModalVisible} transparent animationType="fade">
                <BlurView intensity={40} tint={settings.isDark ? 'dark' : 'light'} style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: 40,
                        borderTopRightRadius: 40,
                        padding: 32,
                        paddingBottom: 48
                    }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: colors.text }}>
                            Edytuj sesję
                        </Text>

                        {/* Przycisk wyboru daty */}
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(!showDatePicker)}
                            style={{
                                backgroundColor: colors.background,
                                padding: 16,
                                borderRadius: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                        >
                            <Text style={{ fontSize: 12, color: colors.textTertiary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 }}>
                                Data
                            </Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                                {formatDate(tempDate.getTime())}
                            </Text>
                        </TouchableOpacity>

                        {/* DateTimePicker - pokazuje się po kliknięciu */}
                        {showDatePicker && (
                            <View style={{ marginBottom: 24 }}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                    locale="pl-PL"
                                    style={{ width: '100%' }}
                                    themeVariant={settings.isDark ? 'dark' : 'light'}
                                />
                            </View>
                        )}

                        {/* Picker czasu */}
                        <TimePicker
                            hours={editHours}
                            minutes={editMinutes}
                            setHours={setEditHours}
                            setMinutes={setEditMinutes}
                            maxHours={maxHours}
                            isDark={settings.isDark}
                        />

                        {/* Przycisk zapisz */}
                        <TouchableOpacity
                            onPress={handleSaveEdit}
                            style={{
                                backgroundColor: colors.primary,
                                paddingVertical: 16,
                                borderRadius: 16,
                                marginTop: 32,
                                shadowColor: '#000',
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 4
                            }}
                        >
                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
                                Zapisz
                            </Text>
                        </TouchableOpacity>

                        {/* Przycisk usuń */}
                        <TouchableOpacity onPress={handleDeleteSession} style={{ marginTop: 16 }}>
                            <Text style={{ textAlign: 'center', color: colors.danger, fontWeight: 'bold' }}>
                                Usuń wpis
                            </Text>
                        </TouchableOpacity>

                        {/* Przycisk anuluj */}
                        <TouchableOpacity
                            onPress={() => {
                                setIsEditModalVisible(false);
                                setShowDatePicker(false);
                            }}
                            style={{ marginTop: 32 }}
                        >
                            <Text style={{ textAlign: 'center', color: colors.textTertiary }}>Anuluj</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}