/**
 * Kontekst do zarządzania sesjami jazdy
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

    // Ładowanie sesji z AsyncStorage
    useEffect(() => {
        const loadSessions = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEYS.DRIVING_SESSIONS);
                if (saved) {
                    const loadedSessions: DrivingSession[] = JSON.parse(saved);

                    // Migracja starych danych - dodanie timestamp jeśli nie istnieje
                    const migratedSessions = loadedSessions.map(session => {
                        if (!session.timestamp) {
                            // Spróbuj odzyskać timestamp z id (jeśli był timestamp) lub stwórz z daty
                            const timestampFromId = parseInt(session.id);
                            const timestamp = !isNaN(timestampFromId) && timestampFromId > 1000000000000
                                ? timestampFromId
                                : new Date(session.date || Date.now()).getTime();

                            // Używamy lokalnej daty zamiast UTC
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

                    // Zapisz zmigrowane dane
                    if (JSON.stringify(loadedSessions) !== JSON.stringify(migratedSessions)) {
                        await AsyncStorage.setItem(
                            STORAGE_KEYS.DRIVING_SESSIONS,
                            JSON.stringify(migratedSessions)
                        );
                    }
                }
            } catch (error) {
                console.error('Błąd ładowania sesji:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSessions();
    }, []);

    // Dodanie nowej sesji
    const addSession = async (session: DrivingSession) => {
        try {
            console.log('🟢 ADD SESSION - przed:', sessions.length);
            const updatedSessions = [session, ...sessions];

            setSessions(updatedSessions);
            console.log('🟢 ADD SESSION - po:', updatedSessions.length, 'Nowa sesja:', session);
            await AsyncStorage.setItem(
                STORAGE_KEYS.DRIVING_SESSIONS,
                JSON.stringify(updatedSessions)
            );

            return true;
        } catch (error) {
            console.error('Błąd dodawania sesji:', error);
            return false;
        }
    };

    // Aktualizacja sesji
    const updateSession = async (id: string, updates: Partial<DrivingSession>) => {
        try {
            console.log('🔵 UPDATE SESSION - ID:', id, 'Updates:', updates);
            const updatedSessions = sessions.map(s =>
                s.id === id ? { ...s, ...updates } : s
            );

            setSessions(updatedSessions);
            console.log('🔵 UPDATE SESSION - zaktualizowano');
            await AsyncStorage.setItem(
                STORAGE_KEYS.DRIVING_SESSIONS,
                JSON.stringify(updatedSessions)
            );

            return true;
        } catch (error) {
            console.error('Błąd aktualizacji sesji:', error);
            return false;
        }
    };

    // Usunięcie sesji
    const deleteSession = async (id: string) => {
        try {
            const updatedSessions = sessions.filter(s => s.id !== id);
            setSessions(updatedSessions);
            await AsyncStorage.setItem(
                STORAGE_KEYS.DRIVING_SESSIONS,
                JSON.stringify(updatedSessions)
            );
            return true;
        } catch (error) {
            console.error('Błąd usuwania sesji:', error);
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
