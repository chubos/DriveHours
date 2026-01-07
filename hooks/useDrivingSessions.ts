/**
 * Context for managing driving sessions
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrivingSession } from '../types';
import { STORAGE_KEYS } from '../constants';

const DrivingSessionsContext = createContext<{
    sessions: DrivingSession[];
    isLoading: boolean;
    addSession: (session: DrivingSession) => Promise<boolean>;
    updateSession: (id: string, updates: Partial<DrivingSession>) => Promise<boolean>;
    deleteSession: (id: string) => Promise<boolean>;
} | null>(null);

export const DrivingSessionsProvider = ({ children }: { children: ReactNode }) => {
    const [sessions, setSessions] = useState<DrivingSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const saveTimeoutRef = useRef<number | null>(null);
    const isSavingRef = useRef(false);

    // Load sessions from AsyncStorage
    useEffect(() => {
        const loadSessions = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEYS.DRIVING_SESSIONS);
                if (saved) {
                    const loadedSessions: DrivingSession[] = JSON.parse(saved);

                    // Migrate old data: add timestamp if missing
                    const migratedSessions = loadedSessions.map(session => {
                        if (!session.timestamp) {
                            // Try to recover timestamp from id (if it was a timestamp) or create it from the date
                            const timestampFromId = parseInt(session.id);
                            const timestamp = !isNaN(timestampFromId) && timestampFromId > 1000000000000
                                ? timestampFromId
                                : new Date(session.date || Date.now()).getTime();

                            // Use local date (not UTC)
                            let dateString = session.date;
                            if (!dateString) {
                                const d = new Date(timestamp);
                                const year = d.getFullYear();
                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                const day = String(d.getDate()).padStart(2, '0');
                                dateString = `${year}-${month}-${day}`;
                            }

                            return {
                                ...session,
                                timestamp,
                                date: dateString,
                            };
                        }
                        return session;
                    });

                    setSessions(migratedSessions);

                    // Persist migrated data
                    if (JSON.stringify(loadedSessions) !== JSON.stringify(migratedSessions)) {
                        await AsyncStorage.setItem(
                            STORAGE_KEYS.DRIVING_SESSIONS,
                            JSON.stringify(migratedSessions)
                        );
                    }
                }
            } catch {
                // Silent error handling
            } finally {
                setIsLoading(false);
            }
        };

        loadSessions();
    }, []);

    // Safe save function with throttling to prevent crashes
    const safeSave = async (updatedSessions: DrivingSession[]) => {
        // Clear any pending save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // If already saving, queue this save
        if (isSavingRef.current) {
            return new Promise<boolean>((resolve) => {
                saveTimeoutRef.current = setTimeout(async () => {
                    try {
                        isSavingRef.current = true;
                        await AsyncStorage.setItem(
                            STORAGE_KEYS.DRIVING_SESSIONS,
                            JSON.stringify(updatedSessions)
                        );
                        isSavingRef.current = false;
                        resolve(true);
                    } catch {
                        isSavingRef.current = false;
                        resolve(false);
                    }
                }, 100);
            });
        }

        // Save immediately
        try {
            isSavingRef.current = true;
            await AsyncStorage.setItem(
                STORAGE_KEYS.DRIVING_SESSIONS,
                JSON.stringify(updatedSessions)
            );
            isSavingRef.current = false;
            return true;
        } catch {
            isSavingRef.current = false;
            return false;
        }
    };

    // Add a new session
    const addSession = async (session: DrivingSession) => {
        try {
            const updatedSessions = [session, ...sessions];
            setSessions(updatedSessions);
            return await safeSave(updatedSessions);
        } catch {
            return false;
        }
    };

    // Update a session
    const updateSession = async (id: string, updates: Partial<DrivingSession>) => {
        try {
            const updatedSessions = sessions.map(s =>
                s.id === id ? { ...s, ...updates } : s
            );
            setSessions(updatedSessions);
            return await safeSave(updatedSessions);
        } catch {
            return false;
        }
    };

    // Delete a session
    const deleteSession = async (id: string) => {
        try {
            const updatedSessions = sessions.filter(s => s.id !== id);
            setSessions(updatedSessions);
            return await safeSave(updatedSessions);
        } catch {
            return false;
        }
    };

    return React.createElement(
        DrivingSessionsContext.Provider,
        { value: { sessions, isLoading, addSession, updateSession, deleteSession } },
        children
    );
};

export const useDrivingSessions = () => {
    const ctx = useContext(DrivingSessionsContext);
    if (!ctx) throw new Error('useDrivingSessions must be used within DrivingSessionsProvider');
    return ctx;
};
