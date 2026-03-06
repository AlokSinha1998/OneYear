/**
 * useCountdowns.ts
 * Stores user-defined countdown events with a target date.
 * Persisted per-entry via MMKV.
 */
import { useState, useCallback } from 'react';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'oneyear-countdowns' });
const STORAGE_KEY = 'all_countdowns';

export type Countdown = {
    id: string;
    label: string;
    emoji: string;
    color: string;
    targetDate: string; // ISO string
};

const COUNTDOWN_EMOJIS = ['🎯', '🎂', '✈️', '🏆', '💍', '🎓', '🏋️', '🌍', '🎵', '📅'];
const COUNTDOWN_COLORS = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'];

export { COUNTDOWN_EMOJIS, COUNTDOWN_COLORS };

const load = (): Countdown[] => {
    const raw = storage.getString(STORAGE_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
};

const save = (items: Countdown[]) => {
    storage.set(STORAGE_KEY, JSON.stringify(items));
};

export const getDaysLeft = (targetDate: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / 86400000);
};

export const useCountdowns = () => {
    const [countdowns, setCountdowns] = useState<Countdown[]>(load);

    const addCountdown = useCallback((label: string, emoji: string, color: string, targetDate: Date) => {
        const id = `cd_${Date.now()}`;
        const item: Countdown = { id, label, emoji, color, targetDate: targetDate.toISOString() };
        const updated = [...load(), item].sort(
            (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime(),
        );
        save(updated);
        setCountdowns(updated);
    }, []);

    const removeCountdown = useCallback((id: string) => {
        const updated = load().filter(c => c.id !== id);
        save(updated);
        setCountdowns(updated);
    }, []);

    const refresh = useCallback(() => { setCountdowns(load()); }, []);

    return { countdowns, addCountdown, removeCountdown, refresh };
};
