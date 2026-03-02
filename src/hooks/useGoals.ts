/**
 * useGoals.ts
 *
 * Goals & Milestones hook — stores user-defined special days per year.
 * Each goal is a { dayIndex, label, emoji, color } record saved with MMKV.
 */

import { useCallback, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'oneyear-goals' });

export type Goal = {
    id: string;         // unique — `${year}-${dayIndex}`
    year: number;
    dayIndex: number;
    label: string;
    emoji: string;
    color: string;
};

const storageKey = (year: number) => `goals_${year}`;

const loadGoals = (year: number): Goal[] => {
    const raw = storage.getString(storageKey(year));
    if (!raw) return [];
    try { return JSON.parse(raw) as Goal[]; }
    catch { return []; }
};

const saveGoals = (year: number, goals: Goal[]) => {
    storage.set(storageKey(year), JSON.stringify(goals));
};

export const GOAL_COLORS = [
    '#F59E0B', // amber
    '#EF4444', // red
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#F97316', // orange
    '#14B8A6', // teal
];

export const GOAL_EMOJIS = ['🎂', '🎯', '🏆', '❤️', '🌟', '✈️', '🎉', '💡', '🏋️', '📚', '🎵', '🌈'];

export const useGoals = (year: number) => {
    const [goals, setGoals] = useState<Goal[]>(() => loadGoals(year));

    const addGoal = useCallback((dayIndex: number, label: string, emoji: string, color: string) => {
        const id = `${year}-${dayIndex}`;
        const existing = loadGoals(year);
        // Remove old goal on same day if exists
        const filtered = existing.filter(g => g.dayIndex !== dayIndex);
        const newGoal: Goal = { id, year, dayIndex, label, emoji, color };
        const updated = [...filtered, newGoal].sort((a, b) => a.dayIndex - b.dayIndex);
        saveGoals(year, updated);
        setGoals(updated);
    }, [year]);

    const removeGoal = useCallback((dayIndex: number) => {
        const existing = loadGoals(year);
        const updated = existing.filter(g => g.dayIndex !== dayIndex);
        saveGoals(year, updated);
        setGoals(updated);
    }, [year]);

    const getGoalForDay = useCallback((dayIndex: number): Goal | undefined => {
        return goals.find(g => g.dayIndex === dayIndex);
    }, [goals]);

    const reloadForYear = useCallback((newYear: number): Goal[] => {
        const loaded = loadGoals(newYear);
        setGoals(loaded);
        return loaded;
    }, []);

    return { goals, addGoal, removeGoal, getGoalForDay, reloadForYear };
};
