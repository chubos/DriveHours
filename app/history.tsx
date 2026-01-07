/**
 * Driving sessions history screen – displays a list of sessions with edit support
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { TimePicker, SettingsButton, useSettings } from '@/components';
import { useDrivingSessions } from '@/hooks';
import { DrivingSession } from '@/types';
import { formatHours, formatDate, dateStringToTimestamp, getSelectedCategory, getColors } from '@/utils';


export default function HistoryPage() {
    // Hooks
    const { t } = useTranslation();
    const settings = useSettings();
    const { sessions, updateSession, deleteSession } = useDrivingSessions();
    const colors = getColors(settings.isDark);
    const isPickerOpenRef = useRef(false);
    const dateChangeTimeoutRef = useRef<number | null>(null);
    const navBarUpdateTimeoutRef = useRef<number | null>(null);

    // Local state
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedSession, setSelectedSession] = useState<DrivingSession | null>(null);
    const [editDate, setEditDate] = useState('');
    const [editHours, setEditHours] = useState(0);
    const [editMinutes, setEditMinutes] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Compute maxHours for the selected category
    const selectedCategory = getSelectedCategory(
        settings.categories,
        settings.selectedCategoryId
    );
    const maxHours = Math.ceil((selectedCategory?.requiredMinutes ?? 30 * 60) / 60);

    // Force refresh when coming back to this screen
    useFocusEffect(
        useCallback(() => {
            setRefreshCounter(prev => prev + 1);
            return () => {
                // Clean up timeouts
                if (dateChangeTimeoutRef.current) {
                    clearTimeout(dateChangeTimeoutRef.current);
                }
                if (navBarUpdateTimeoutRef.current) {
                    clearTimeout(navBarUpdateTimeoutRef.current);
                }
            };
        }, [])
    );

    // Close the modal once the session is updated
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

    // Ensure the picker is closed when modal closes
    useEffect(() => {
        if (!isEditModalVisible) {
            setShowDatePicker(false);
            isPickerOpenRef.current = false;
        }
    }, [isEditModalVisible]);


    // Filter and sort sessions
    const filteredSessions = sessions
        .filter(s => s.categoryId === settings.selectedCategoryId)
        .sort((a, b) => b.timestamp - a.timestamp);

    // Open edit modal
    const handleOpenEdit = (session: DrivingSession) => {
        setShowDatePicker(false); // Explicitly close picker before opening modal
        isPickerOpenRef.current = false; // Reset ref
        setSelectedSession(session);
        setEditDate(session.date);
        setTempDate(new Date(session.timestamp));
        setEditHours(Math.floor(session.durationMinutes / 60));
        setEditMinutes(session.durationMinutes % 60);
        setIsEditModalVisible(true);
    };

    // Handle date change
    const onDateChange = (event: any, selectedDate?: Date) => {
        // Clear any pending date change timeout
        if (dateChangeTimeoutRef.current) {
            clearTimeout(dateChangeTimeoutRef.current);
        }

        // On Android: always close picker after interaction
        if (Platform.OS === 'android') {
            // If a user canceled, don't update the date
            if (event.type === 'dismissed') {
                setShowDatePicker(false);
                isPickerOpenRef.current = false;
                return;
            }

            // Close picker immediately
            setShowDatePicker(false);

            // Reset ref with a small delay to prevent immediate reopening
            dateChangeTimeoutRef.current = setTimeout(() => {
                isPickerOpenRef.current = false;
            }, 300);
        }

        // Update the date with debouncing
        if (selectedDate) {
            dateChangeTimeoutRef.current = setTimeout(() => {
                setTempDate(selectedDate);

                // Use local date (no UTC conversion) to avoid timezone issues
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;

                setEditDate(dateString);
            }, 50);
        }
    };

    // Save edits
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
            Alert.alert('Cant save changes. Please try again later.');
        }
        // If success=true, the useEffect will close the modal once data is updated
    };

    // Delete session
    const handleDeleteSession = () => {
        if (!selectedSession) return;

        Alert.alert(
            t('history.delete'),
            t('history.confirmDelete'),
            [
                { text: t('history.cancel'), style: 'cancel' },
                {
                    text: t('history.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        // Clean up all pending timeouts
                        if (dateChangeTimeoutRef.current) {
                            clearTimeout(dateChangeTimeoutRef.current);
                        }
                        if (navBarUpdateTimeoutRef.current) {
                            clearTimeout(navBarUpdateTimeoutRef.current);
                        }

                        await deleteSession(selectedSession.id);
                        setIsEditModalVisible(false);
                        setShowDatePicker(false);
                        isPickerOpenRef.current = false;
                        setSelectedSession(null);
                    },
                },
            ]
        );
    };

    // Render a single session
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
                <Text style={{ color: colors.textTertiary, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>{t('history.date')}</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>{formatDate(item.timestamp)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textTertiary, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>{t('history.duration')}</Text>
                <Text style={{ fontSize: 20, fontWeight: '900', color: colors.primary }}>
                    {formatHours(item.durationMinutes)} h
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center' }}>
            {/* Settings button - rendered with proper layering for touch events */}
            <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
                <SettingsButton onPress={settings.open} isDark={settings.isDark} />
            </View>

            <View style={{ flex: 1, padding: 24, paddingTop: 64, maxWidth: 800, width: '100%' }}>
                {/* Category name */}
                <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                    {t('history.category')} {selectedCategory?.name || 'B'}
                </Text>

                {/* Header */}
                <Text style={{ fontSize: 30, fontWeight: '900', marginBottom: 24, color: colors.text }}>{t('history.title')}</Text>

                {/* Sessions list or empty state */}
                {filteredSessions.length === 0 ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: colors.textTertiary, fontSize: 18 }}>{t('history.noSessions')}</Text>
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

            {/* Edit session modal */}
            <Modal
                visible={isEditModalVisible}
                transparent
                animationType="fade"
            >
                <BlurView intensity={40} tint={settings.isDark ? 'dark' : 'light'} style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: 40,
                        borderTopRightRadius: 40,
                        padding: 32,
                        paddingBottom: 48
                    }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: colors.text }}>
                            {t('history.editSession')}
                        </Text>

                        {/* Date selection button */}
                        <TouchableOpacity
                            onPress={() => {
                                // Prevent multiple picker openings on Android
                                if (Platform.OS === 'android') {
                                    if (isPickerOpenRef.current || showDatePicker) {
                                        return;
                                    }
                                    // Set the ref immediately to prevent rapid clicks
                                    isPickerOpenRef.current = true;

                                    // Delay showing picker slightly to ensure the state is stable
                                    setTimeout(() => {
                                        setShowDatePicker(true);
                                    }, 50);
                                } else {
                                    // iOS: just toggle
                                    setShowDatePicker(prev => !prev);
                                }
                            }}
                            disabled={showDatePicker && Platform.OS === 'android'}
                            style={{
                                backgroundColor: colors.background,
                                padding: 16,
                                borderRadius: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border,
                                opacity: (showDatePicker && Platform.OS === 'android') ? 0.5 : 1
                            }}
                        >
                            <Text style={{ fontSize: 12, color: colors.textTertiary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 }}>
                                {t('history.date')}
                            </Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                                {formatDate(tempDate.getTime())}
                            </Text>
                        </TouchableOpacity>

                        {/* DateTimePicker - shows after click */}
                        {showDatePicker && Platform.OS === 'android' && (
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                                themeVariant={settings.isDark ? 'dark' : 'light'}
                            />
                        )}
                        {showDatePicker && Platform.OS === 'ios' && (
                            <View style={{ marginBottom: 24 }}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                    locale="pl-PL"
                                    style={{ width: '100%' }}
                                    themeVariant={settings.isDark ? 'dark' : 'light'}
                                />
                            </View>
                        )}

                        {/* Time picker */}
                        <TimePicker
                            hours={editHours}
                            minutes={editMinutes}
                            setHours={setEditHours}
                            setMinutes={setEditMinutes}
                            maxHours={maxHours}
                            isDark={settings.isDark}
                        />

                        {/* Save button */}
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
                                {t('history.save')}
                            </Text>
                        </TouchableOpacity>

                        {/* Delete button */}
                        <TouchableOpacity onPress={handleDeleteSession} style={{ marginTop: 16 }}>
                            <Text style={{ textAlign: 'center', color: colors.danger, fontWeight: 'bold' }}>
                                {t('history.delete')}
                            </Text>
                        </TouchableOpacity>

                        {/* Cancel button */}
                        <TouchableOpacity
                            onPress={() => {
                                // Clean up all pending timeouts
                                if (dateChangeTimeoutRef.current) {
                                    clearTimeout(dateChangeTimeoutRef.current);
                                }
                                if (navBarUpdateTimeoutRef.current) {
                                    clearTimeout(navBarUpdateTimeoutRef.current);
                                }

                                // Reset all states
                                setIsEditModalVisible(false);
                                setShowDatePicker(false);
                                isPickerOpenRef.current = false;
                            }}
                            style={{ marginTop: 32 }}
                        >
                            <Text style={{ textAlign: 'center', color: colors.textTertiary }}>{t('history.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}