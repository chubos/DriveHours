"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Pressable, Text, TextInput, TouchableOpacity, View, Alert, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Category, SettingsContextValue, ThemeMode } from '../types';
import { STORAGE_KEYS, DEFAULT_CATEGORIES, UI_DIMENSIONS, GESTURE_CONFIG } from '../constants';
import { getColors } from '../utils/colors';

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);


export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryIdState] = useState<string | null>(null);
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const systemColorScheme = useColorScheme();

    // Oblicz czy używamy dark mode
    const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

    useEffect(() => {
        const load = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
                if (raw) {
                    setCategories(JSON.parse(raw));
                } else {
                    // Domyślne kategorie
                    setCategories(DEFAULT_CATEGORIES);
                    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
                }

                const sel = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CATEGORY);
                if (sel) setSelectedCategoryIdState(sel);
                else if (!sel) {
                    setSelectedCategoryIdState('B');
                    // open settings drawer so user can change default on first run
                    setIsOpen(true);
                }

                // Załaduj motyw
                const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
                    setThemeModeState(savedTheme as ThemeMode);
                }
            } catch (e) {
                console.error('Failed to load categories', e);
            }
        };
        load();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)).catch(e => console.error(e));
    }, [categories]);

    useEffect(() => {
        if (selectedCategoryId) AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY, selectedCategoryId).catch(e => console.error(e));
    }, [selectedCategoryId]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode).catch(e => console.error(e));
    }, [themeMode]);

    const addCategory = (c: Omit<Category, 'id'>) => {
        const id = String(Date.now());
        setCategories(prev => [...prev, { ...c, id }]);
        setSelectedCategoryIdState(id);
    };

    const updateCategory = (id: string, patch: Partial<Category>) => {
        setCategories(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    };

    const deleteCategory = (id: string) => {
        setCategories(prev => prev.filter(p => p.id !== id));
        if (selectedCategoryId === id) setSelectedCategoryIdState(categories[0]?.id ?? null);
    };

    const setSelectedCategoryId = (id: string) => setSelectedCategoryIdState(id);

    const setThemeMode = (mode: ThemeMode) => setThemeModeState(mode);

    const value: SettingsContextValue = {
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        isOpen,
        categories,
        selectedCategoryId,
        setSelectedCategoryId,
        addCategory,
        updateCategory,
        deleteCategory,
        themeMode,
        setThemeMode,
        isDark,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
            <SettingsDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
};

// Drawer component
function SettingsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const screenW = Dimensions.get('window').width;
    const drawerW = Math.min(UI_DIMENSIONS.DRAWER_MAX_WIDTH, Math.round(screenW * UI_DIMENSIONS.DRAWER_WIDTH_PERCENT));
    const translateX = useRef(new Animated.Value(-drawerW)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.95)).current;
    const { categories, selectedCategoryId, setSelectedCategoryId, addCategory, updateCategory, deleteCategory, themeMode, setThemeMode, isDark } = useSettingsSafe();
    const colors = getColors(isDark);

    // Stan kontrolujący widoczność Modal - opóźniony dla animacji
    const [showModal, setShowModal] = useState(false);

    // Modals
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [editNameLocal, setEditNameLocal] = useState('');
    const [editHoursLocal, setEditHoursLocal] = useState('30');

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [addNameLocal, setAddNameLocal] = useState('');
    const [addHoursLocal, setAddHoursLocal] = useState('30');

    useEffect(() => {
        if (isOpen) {
            // Pokazuj Modal natychmiast
            setShowModal(true);

            // Reset początkowych wartości przed animacją
            translateX.setValue(-drawerW);
            overlayOpacity.setValue(0);
            scale.setValue(0.95);

            // Płynna animacja otwierania - spring dla naturalnego ruchu
            Animated.parallel([
                Animated.spring(translateX, {
                    toValue: 0,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            // Płynna animacja zamykania - timing dla kontrolowanego ruchu
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: -drawerW,
                    duration: 250,
                    useNativeDriver: true
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true
                }),
                Animated.timing(scale, {
                    toValue: 0.95,
                    duration: 250,
                    useNativeDriver: true
                })
            ]).start(() => {
                // Ukryj Modal dopiero po zakończeniu animacji
                setShowModal(false);
            });
        }
    }, [isOpen, drawerW, translateX, overlayOpacity, scale]);

    // PanResponder to drag to close - tylko przeciąganie w lewo zamyka
    const pan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => {
            // Tylko gdy przeciągamy w lewo (gesture.dx < 0) i wystarczająco mocno
            return gesture.dx < -10 && Math.abs(gesture.dy) < 50;
        },
        onPanResponderMove: (_, gesture) => {
            // Tylko ujemne wartości (przeciąganie w lewo)
            if (gesture.dx < 0) {
                const newX = Math.max(gesture.dx, -drawerW);
                translateX.setValue(newX);
                overlayOpacity.setValue(1 + (newX / drawerW));
            }
        },
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dx < GESTURE_CONFIG.DISMISS_THRESHOLD || gesture.vx < -0.5) {
                // Zamknij drawer - płynna animacja
                Animated.parallel([
                    Animated.timing(translateX, {
                        toValue: -drawerW,
                        duration: 250,
                        useNativeDriver: true
                    }),
                    Animated.timing(overlayOpacity, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true
                    }),
                    Animated.timing(scale, {
                        toValue: 0.95,
                        duration: 250,
                        useNativeDriver: true
                    })
                ]).start(() => {
                    // Wywołaj onClose dopiero po zakończeniu animacji
                    onClose();
                    setShowModal(false);
                });
            } else {
                // Wróć do pozycji otwartej - spring dla odbicia
                Animated.parallel([
                    Animated.spring(translateX, {
                        toValue: 0,
                        tension: 65,
                        friction: 11,
                        useNativeDriver: true
                    }),
                    Animated.timing(overlayOpacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true
                    }),
                    Animated.spring(scale, {
                        toValue: 1,
                        tension: 65,
                        friction: 11,
                        useNativeDriver: true
                    })
                ]).start();
            }
        }
    })).current;

    const openAddModal = () => {
        setAddNameLocal('');
        setAddHoursLocal('30');
        setAddModalVisible(true);
    };

    const handleAddCategory = () => {
        const h = Math.max(0, Number(addHoursLocal) || 0);
        addCategory({
            name: addNameLocal || `Kategoria ${categories.length + 1}`,
            requiredMinutes: h * 60
        });
        setAddModalVisible(false);
        setAddNameLocal('');
        setAddHoursLocal('30');
    };

    const openEditModal = (cat: Category) => {
        setEditTarget(cat);
        setEditNameLocal(cat.name);
        setEditHoursLocal(String(Math.round(cat.requiredMinutes / 60)));
        setEditModalVisible(true);
    };

    const handleSaveEdit = () => {
        if (!editTarget) return;
        const h = Math.max(0, Number(editHoursLocal) || 0);
        updateCategory(editTarget.id, { name: editNameLocal, requiredMinutes: h * 60 });
        setEditModalVisible(false);
        setEditTarget(null);
    };

    // Interpolacja dla płynnego fade overlay
    const overlayBackground = overlayOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']
    });

    return (
        <Modal transparent visible={showModal} animationType="none" onRequestClose={onClose}>
            <Animated.View
                style={{
                    flex: 1,
                    backgroundColor: overlayBackground,
                }}
            >
                <Pressable
                    style={{ flex: 1 }}
                    onPress={onClose}
                />
            </Animated.View>
            <Animated.View
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: drawerW,
                    backgroundColor: colors.surface,
                    transform: [{ translateX }, { scale }],
                    shadowColor: '#000',
                    shadowOffset: { width: 2, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                }}
                {...pan.panHandlers}
            >
                <View style={{ padding: 16, paddingTop: 56, borderBottomWidth: 1, borderColor: colors.border }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Ustawienia</Text>
                    <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Kategorie prawa jazdy</Text>
                </View>

                <View style={{ padding: 12, flex: 1 }}>
                    {/* Sekcja motywu */}
                    <View style={{ marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderColor: colors.border }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 12 }}>MOTYW</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                onPress={() => setThemeMode('light')}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: themeMode === 'light' ? '#3b82f6' : colors.border,
                                    backgroundColor: themeMode === 'light' ? (isDark ? '#1e3a8a' : '#dbeafe') : colors.background,
                                    alignItems: 'center'
                                }}
                            >
                                <Ionicons
                                    name="sunny"
                                    size={24}
                                    color={themeMode === 'light' ? '#3b82f6' : colors.textSecondary}
                                    style={{ marginBottom: 4 }}
                                />
                                <Text style={{ fontSize: 11, fontWeight: '700', color: themeMode === 'light' ? '#3b82f6' : colors.textSecondary }}>Jasny</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setThemeMode('dark')}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: themeMode === 'dark' ? '#3b82f6' : colors.border,
                                    backgroundColor: themeMode === 'dark' ? (isDark ? '#1e3a8a' : '#dbeafe') : colors.background,
                                    alignItems: 'center'
                                }}
                            >
                                <Ionicons
                                    name="moon"
                                    size={24}
                                    color={themeMode === 'dark' ? '#3b82f6' : colors.textSecondary}
                                    style={{ marginBottom: 4 }}
                                />
                                <Text style={{ fontSize: 11, fontWeight: '700', color: themeMode === 'dark' ? '#3b82f6' : colors.textSecondary }}>Ciemny</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setThemeMode('system')}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: themeMode === 'system' ? '#3b82f6' : colors.border,
                                    backgroundColor: themeMode === 'system' ? (isDark ? '#1e3a8a' : '#dbeafe') : colors.background,
                                    alignItems: 'center'
                                }}
                            >
                                <Ionicons
                                    name="phone-portrait-outline"
                                    size={24}
                                    color={themeMode === 'system' ? '#3b82f6' : colors.textSecondary}
                                    style={{ marginBottom: 4 }}
                                />
                                <Text style={{ fontSize: 11, fontWeight: '700', color: themeMode === 'system' ? '#3b82f6' : colors.textSecondary }}>System</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sekcja kategorii */}
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 12 }}>KATEGORIE</Text>
                    {categories.map((cat: Category) => (
                        <View key={cat.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setSelectedCategoryId(cat.id)}>
                                <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: selectedCategoryId === cat.id ? '#3b82f6' : colors.border, marginRight: 12, backgroundColor: selectedCategoryId === cat.id ? '#3b82f6' : 'transparent' }} />
                                <View>
                                    <Text style={{ fontWeight: '700', color: colors.text }}>{cat.name}</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{Math.round(cat.requiredMinutes / 60)} h</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity onPress={() => openEditModal(cat)}>
                                    <Text style={{ color: '#2563eb', marginRight: 12 }}>Edytuj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    // confirm before deleting category
                                    if (categories.length <= 1) {
                                        Alert.alert('Nie można usunąć', 'Musisz mieć przynajmniej jedną kategorię.');
                                        return;
                                    }
                                    Alert.alert(
                                        'Usuń kategorię',
                                        `Czy na pewno chcesz usunąć kategorię "${cat.name}"? Ta operacja usunie tylko kategorię, nie usuwa sesji.`,
                                        [
                                            { text: 'Anuluj', style: 'cancel' },
                                            { text: 'Usuń', style: 'destructive', onPress: () => deleteCategory(cat.id) }
                                        ]
                                    );
                                }}>
                                    <Text style={{ color: '#ef4444' }}>Usuń</Text>
                                </TouchableOpacity>
                             </View>
                         </View>
                     ))}

                    {/* Przycisk dodania nowej kategorii */}
                    <TouchableOpacity
                        onPress={openAddModal}
                        style={{
                            borderTopWidth: 1,
                            borderColor: colors.border,
                            paddingTop: 16,
                            marginTop: 12,
                            backgroundColor: '#3b82f6',
                            padding: 14,
                            borderRadius: 12,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>+</Text>
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Dodaj kategorię</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Modal dodawania kategorii */}
            <Modal transparent visible={addModalVisible} animationType="fade">
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => setAddModalVisible(false)}
                />
                <View style={{
                    position: 'absolute',
                    left: 20,
                    right: 20,
                    top: '35%',
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8
                }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 16 }}>Nowa kategoria</Text>
                    <Text style={{ color: '#666', marginBottom: 4, fontWeight: '600' }}>Nazwa kategorii</Text>
                    <TextInput
                        value={addNameLocal}
                        onChangeText={setAddNameLocal}
                        placeholder="np. Kategoria B"
                        style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 12,
                            fontSize: 16
                        }}
                    />
                    <Text style={{ color: '#666', marginBottom: 4, fontWeight: '600' }}>Wymagane godziny</Text>
                    <TextInput
                        value={addHoursLocal}
                        onChangeText={setAddHoursLocal}
                        placeholder="30"
                        keyboardType="numeric"
                        style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 16,
                            fontSize: 16
                        }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => setAddModalVisible(false)}
                            style={{ padding: 12, paddingHorizontal: 20 }}
                        >
                            <Text style={{ color: '#6b7280', fontWeight: '600' }}>Anuluj</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleAddCategory}
                            style={{ backgroundColor: '#3b82f6', padding: 12, paddingHorizontal: 24, borderRadius: 10 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>Dodaj</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal edycji kategorii */}
            <Modal transparent visible={editModalVisible} animationType="fade">
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => setEditModalVisible(false)}
                />
                <View style={{
                    position: 'absolute',
                    left: 20,
                    right: 20,
                    top: '35%',
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8
                }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 16 }}>Edytuj kategorię</Text>
                    <Text style={{ color: '#666', marginBottom: 4, fontWeight: '600' }}>Nazwa kategorii</Text>
                    <TextInput
                        value={editNameLocal}
                        onChangeText={setEditNameLocal}
                        placeholder="Nazwa"
                        style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 12,
                            fontSize: 16
                        }}
                    />
                    <Text style={{ color: '#666', marginBottom: 4, fontWeight: '600' }}>Wymagane godziny</Text>
                    <TextInput
                        value={editHoursLocal}
                        onChangeText={setEditHoursLocal}
                        placeholder="Godziny"
                        keyboardType="numeric"
                        style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 16,
                            fontSize: 16
                        }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => { setEditModalVisible(false); setEditTarget(null); }}
                            style={{ padding: 12, paddingHorizontal: 20 }}
                        >
                            <Text style={{ color: '#6b7280', fontWeight: '600' }}>Anuluj</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSaveEdit}
                            style={{ backgroundColor: '#3b82f6', padding: 12, paddingHorizontal: 24, borderRadius: 10 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>Zapisz</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

// Helper: safe access to SettingsContext from within drawer (context is provided above)
function useSettingsSafe() {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        // if context not ready, provide no-op defaults
        return {
            categories: [],
            selectedCategoryId: null,
            setSelectedCategoryId: () => { },
            addCategory: () => { },
            updateCategory: () => { },
            deleteCategory: () => { },
            themeMode: 'system' as ThemeMode,
            setThemeMode: () => { },
        } as any;
    }
    return ctx;
}

