"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Pressable, Text, TextInput, TouchableOpacity, View, Alert, useColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as NavigationBar from 'expo-navigation-bar';
import { Category, SettingsContextValue, ThemeMode } from '@/types';
import { STORAGE_KEYS, DEFAULT_CATEGORIES, UI_DIMENSIONS, GESTURE_CONFIG } from '@/constants';
import { getColors } from '@/utils';

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);


export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryIdState] = useState<string | null>(null);
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const systemColorScheme = useColorScheme();
    const saveTimeoutRef = useRef<{
        categories?: number;
        selectedCategory?: number;
        theme?: number;
    }>({});

    // Whether we're currently using dark mode
    const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

    useEffect(() => {
        const load = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
                if (raw) {
                    setCategories(JSON.parse(raw));
                } else {
                    // Default categories
                    setCategories(DEFAULT_CATEGORIES);
                    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
                }

                const sel = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CATEGORY);
                if (sel) setSelectedCategoryIdState(sel);
                else if (!sel) {
                    setSelectedCategoryIdState('B');
                    // open settings drawer so user can change default on the first run
                    setIsOpen(true);
                }

                // Load theme
                const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
                    setThemeModeState(savedTheme as ThemeMode);
                }
            } catch {
                // Silent error handling
            }
        };
        void load();
    }, []);

    useEffect(() => {
        // Throttle AsyncStorage writes
        if (saveTimeoutRef.current.categories) {
            clearTimeout(saveTimeoutRef.current.categories);
        }

        saveTimeoutRef.current.categories = setTimeout(() => {
            AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)).catch(() => {});
        }, 300);

        return () => {
            if (saveTimeoutRef.current.categories) {
                clearTimeout(saveTimeoutRef.current.categories);
            }
        };
    }, [categories]);

    useEffect(() => {
        if (selectedCategoryId) {
            // Throttle AsyncStorage writes
            if (saveTimeoutRef.current.selectedCategory) {
                clearTimeout(saveTimeoutRef.current.selectedCategory);
            }

            saveTimeoutRef.current.selectedCategory = setTimeout(() => {
                AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY, selectedCategoryId).catch(() => {});
            }, 300);

            return () => {
                if (saveTimeoutRef.current.selectedCategory) {
                    clearTimeout(saveTimeoutRef.current.selectedCategory);
                }
            };
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        // Throttle AsyncStorage writes
        if (saveTimeoutRef.current.theme) {
            clearTimeout(saveTimeoutRef.current.theme);
        }

        saveTimeoutRef.current.theme = setTimeout(() => {
            AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode).catch(() => {});
        }, 300);

        return () => {
            if (saveTimeoutRef.current.theme) {
                clearTimeout(saveTimeoutRef.current.theme);
            }
        };
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
        setCategories(prev => {
            const filtered = prev.filter(p => p.id !== id);

            // If we're deleting the selected category, select the first remaining one
            if (selectedCategoryId === id && filtered.length > 0) {
                setSelectedCategoryIdState(filtered[0].id);
            }

            return filtered;
        });
    };

    const setSelectedCategoryId = (id: string) => setSelectedCategoryIdState(id);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
    };

    const open = () => {
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
    };

    const value: SettingsContextValue = {
        open,
        close,
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
    const { t } = useTranslation();
    const screenW = Dimensions.get('window').width;
    const drawerW = Math.min(UI_DIMENSIONS.DRAWER_MAX_WIDTH, Math.round(screenW * UI_DIMENSIONS.DRAWER_WIDTH_PERCENT));
    const translateX = useRef(new Animated.Value(-drawerW)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.95)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);
    const { categories, selectedCategoryId, setSelectedCategoryId, addCategory, updateCategory, deleteCategory, themeMode, setThemeMode, isDark } = useSettingsSafe();
    const colors = getColors(isDark);

    // Controls Modal visibility (delayed to allow close animation)
    const [showModal, setShowModal] = useState(false);

    // Modals
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [editNameLocal, setEditNameLocal] = useState('');
    const [editHoursLocal, setEditHoursLocal] = useState('30');

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [addNameLocal, setAddNameLocal] = useState('');
    const [addHoursLocal, setAddHoursLocal] = useState('30');

    const navBarUpdateTimeoutRef = useRef<number | null>(null);

    // Consolidated navigation bar updates with debouncing to prevent crashes
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const updateNavigationBar = async () => {
            try {
                if (NavigationBar?.setButtonStyleAsync) {
                    await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
                }
            } catch {
                // Silently fail to prevent crashes
            }
        };

        // Clear previous timeout
        if (navBarUpdateTimeoutRef.current) {
            clearTimeout(navBarUpdateTimeoutRef.current);
        }

        // Debounce timer to prevent too many rapid updates
        navBarUpdateTimeoutRef.current = setTimeout(updateNavigationBar, 150);

        return () => {
            if (navBarUpdateTimeoutRef.current) {
                clearTimeout(navBarUpdateTimeoutRef.current);
            }
        };
    }, [isDark]); // Only depend on isDark, not modal states

    useEffect(() => {
        if (isOpen) {
            // Stop any existing animation
            if (animationRef.current) {
                animationRef.current.stop();
            }

            // Show Modal immediately
            setShowModal(true);

            // Reset initial values before opening animation
            translateX.setValue(-drawerW);
            overlayOpacity.setValue(0);
            scale.setValue(0.95);

            // Smooth opening animation - spring for a natural feel
            animationRef.current = Animated.parallel([
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
            ]);
            animationRef.current.start();
        } else if (showModal) {
            // Stop any existing animation
            if (animationRef.current) {
                animationRef.current.stop();
            }

            // Only animate close if modal is currently shown
            // Smooth closing animation - timing for controlled motion
            animationRef.current = Animated.parallel([
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
            ]);
            animationRef.current.start(() => {
                // Hide Modal only after the animation finishes
                setShowModal(false);
                animationRef.current = null;
            });
        }

        return () => {
            // Cleanup: stop animation on unmounting
            if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
        };
        // translateX, overlayOpacity, scale, and showModal are refs/state used in the effect
    }, [isOpen, drawerW, translateX, overlayOpacity, scale, showModal]);

    // PanResponder for drag-to-close - only dragging left closes
    const pan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => {
            // Only when dragging left (gesture.dx < 0) and not too vertical
            return gesture.dx < -10 && Math.abs(gesture.dy) < 50;
        },
        onPanResponderMove: (_, gesture) => {
            // Only negative values (dragging left)
            if (gesture.dx < 0) {
                const newX = Math.max(gesture.dx, -drawerW);
                translateX.setValue(newX);
                overlayOpacity.setValue(1 + (newX / drawerW));
            }
        },
        onPanResponderRelease: (_, gesture) => {
            // Stop any existing animation
            if (animationRef.current) {
                animationRef.current.stop();
            }

            if (gesture.dx < GESTURE_CONFIG.DISMISS_THRESHOLD || gesture.vx < -0.5) {
                // Close drawer - smooth animation
                animationRef.current = Animated.parallel([
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
                ]);
                animationRef.current.start(() => {
                    // Call onClose only after the animation finishes
                    onClose();
                    setShowModal(false);
                    animationRef.current = null;
                });
            } else {
                // Bounce back to the open position - spring animation
                animationRef.current = Animated.parallel([
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
                ]);
                animationRef.current.start(() => {
                    animationRef.current = null;
                });
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
            name: addNameLocal || `${t('home.category')} ${categories.length + 1}`,
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

    // Interpolation for smooth overlay fade
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
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{t('settings.title')}</Text>
                    <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{t('settings.categories')}</Text>
                </View>

                <View style={{ padding: 12, flex: 1 }}>
                    {/* Theme section */}
                    <View style={{ marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderColor: colors.border }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 12 }}>{t('settings.appearance').toUpperCase()}</Text>
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
                                <Text style={{ fontSize: 11, fontWeight: '700', color: themeMode === 'light' ? '#3b82f6' : colors.textSecondary }}>{t('settings.light')}</Text>
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
                                <Text style={{ fontSize: 11, fontWeight: '700', color: themeMode === 'dark' ? '#3b82f6' : colors.textSecondary }}>{t('settings.dark')}</Text>
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
                                <Text style={{ fontSize: 11, fontWeight: '700', color: themeMode === 'system' ? '#3b82f6' : colors.textSecondary }}>{t('settings.system')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Categories section */}
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 12 }}>{t('settings.selectCategory').toUpperCase()}</Text>
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
                                    <Text style={{ color: '#2563eb', marginRight: 12 }}>{t('history.edit')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    // confirm before deleting a category
                                    if (categories.length <= 1) {
                                        Alert.alert(t('settings.cannotDelete'), t('settings.mustHaveOne'));
                                        return;
                                    }
                                    Alert.alert(
                                        t('settings.deleteCategory'),
                                        t('settings.deleteCategoryConfirm', { name: cat.name }),
                                        [
                                            { text: t('history.cancel'), style: 'cancel' },
                                            { text: t('history.delete'), style: 'destructive', onPress: () => deleteCategory(cat.id) }
                                        ]
                                    );
                                }}>
                                    <Text style={{ color: '#ef4444' }}>{t('history.delete')}</Text>
                                </TouchableOpacity>
                             </View>
                         </View>
                     ))}

                    {/* Add a category button */}
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
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{t('settings.addCategory')}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Add category modal */}
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
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8
                }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 16, color: colors.text }}>{t('settings.newCategory')}</Text>
                    <Text style={{ color: colors.textSecondary, marginBottom: 4, fontWeight: '600' }}>{t('settings.categoryName')}</Text>
                    <TextInput
                        value={addNameLocal}
                        onChangeText={setAddNameLocal}
                        placeholder={t('settings.categoryName')}
                        placeholderTextColor={colors.textTertiary}
                        selectionColor={colors.primary}
                        cursorColor={colors.primary}
                        style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text,
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 12,
                            fontSize: 16
                        }}
                    />
                    <Text style={{ color: colors.textSecondary, marginBottom: 4, fontWeight: '600' }}>{t('settings.requiredHours')}</Text>
                    <TextInput
                        value={addHoursLocal}
                        onChangeText={setAddHoursLocal}
                        placeholder="30"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                        selectionColor={colors.primary}
                        cursorColor={colors.primary}
                        style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text,
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
                            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('history.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleAddCategory}
                            style={{ backgroundColor: '#3b82f6', padding: 12, paddingHorizontal: 24, borderRadius: 10 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('modal.add')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit category modal */}
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
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8
                }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 16, color: colors.text }}>{t('settings.editCategory')}</Text>
                    <Text style={{ color: colors.textSecondary, marginBottom: 4, fontWeight: '600' }}>{t('settings.categoryName')}</Text>
                    <TextInput
                        value={editNameLocal}
                        onChangeText={setEditNameLocal}
                        placeholder={t('settings.categoryName')}
                        placeholderTextColor={colors.textTertiary}
                        selectionColor={colors.primary}
                        cursorColor={colors.primary}
                        style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text,
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 12,
                            fontSize: 16
                        }}
                    />
                    <Text style={{ color: colors.textSecondary, marginBottom: 4, fontWeight: '600' }}>{t('settings.requiredHours')}</Text>
                    <TextInput
                        value={editHoursLocal}
                        onChangeText={setEditHoursLocal}
                        placeholder={t('settings.requiredHours')}
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                        selectionColor={colors.primary}
                        cursorColor={colors.primary}
                        style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text,
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
                            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('history.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSaveEdit}
                            style={{ backgroundColor: '#3b82f6', padding: 12, paddingHorizontal: 24, borderRadius: 10 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('history.save')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

// Helper: safe access to SettingsContext from within the drawer (context is provided above)
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
