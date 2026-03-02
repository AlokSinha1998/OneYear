import React, { createContext, useContext, useState, useEffect } from 'react';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'oneyear-theme' });

export type ThemeKey = 'default' | 'amoled' | 'pastel' | 'cosmic' | 'forest';

export type Theme = {
    key: ThemeKey;
    name: string;
    background: string;
    headerText: string;
    subText: string;
    dotPalette: [string, string][];
    todayDot: [string, string];
    menuBg: string;
    menuText: string;
};

export const THEMES: Record<ThemeKey, Theme> = {
    default: {
        key: 'default',
        name: '🌈 Rainbow',
        background: '#000',
        headerText: '#fff',
        subText: '#aaa',
        dotPalette: [
            ['#8B5CF6', '#6366F1'],
            ['#3B82F6', '#2563EB'],
            ['#06B6D4', '#0891B2'],
            ['#10B981', '#059669'],
            ['#F59E0B', '#D97706'],
            ['#EF4444', '#DC2626'],
            ['#EC4899', '#DB2777'],
            ['#8B5CF6', '#A855F7'],
            ['#14B8A6', '#0D9488'],
            ['#84CC16', '#65A30D'],
            ['#F97316', '#EA580C'],
            ['#6366F1', '#4F46E5'],
        ],
        todayDot: ['#FCD34D', '#F59E0B'],
        menuBg: '#fff',
        menuText: '#333',
    },
    amoled: {
        key: 'amoled',
        name: '🌑 AMOLED',
        background: '#000',
        headerText: '#e0e0e0',
        subText: '#666',
        dotPalette: [
            ['#444', '#333'],
            ['#555', '#444'],
            ['#3a3a3a', '#2a2a2a'],
            ['#404040', '#303030'],
            ['#4a4a4a', '#3a3a3a'],
            ['#383838', '#282828'],
            ['#424242', '#323232'],
            ['#484848', '#383838'],
            ['#3c3c3c', '#2c2c2c'],
            ['#464646', '#363636'],
            ['#3e3e3e', '#2e2e2e'],
            ['#424242', '#323232'],
        ],
        todayDot: ['#e0e0e0', '#bdbdbd'],
        menuBg: '#111',
        menuText: '#e0e0e0',
    },
    pastel: {
        key: 'pastel',
        name: '🍭 Pastel',
        background: '#1a1a2e',
        headerText: '#fce4ec',
        subText: '#f8bbd0',
        dotPalette: [
            ['#ffb3c1', '#ff8fab'],
            ['#ffc8dd', '#ffafcc'],
            ['#bde0fe', '#a2d2ff'],
            ['#cdb4db', '#b5a8d0'],
            ['#ffd6a5', '#ffb347'],
            ['#caffbf', '#9bf6a0'],
            ['#f9c74f', '#f4a261'],
            ['#a8dadc', '#83c5be'],
            ['#e9c46a', '#f4a261'],
            ['#90e0ef', '#48cae4'],
            ['#dab8f3', '#c77dff'],
            ['#f2c4ce', '#e9a0b0'],
        ],
        todayDot: ['#fff', '#f9f9f9'],
        menuBg: '#1E1B4B',
        menuText: '#fce4ec',
    },
    cosmic: {
        key: 'cosmic',
        name: '🌌 Cosmic',
        background: '#0a0015',
        headerText: '#e0c3fc',
        subText: '#9d97b8',
        dotPalette: [
            ['#7b2ff7', '#4a00e0'],
            ['#ff6ec7', '#c200fb'],
            ['#00c6ff', '#0072ff'],
            ['#f7971e', '#ffd200'],
            ['#ee0979', '#ff6a00'],
            ['#42e695', '#3bb2b8'],
            ['#c471f5', '#fa71cd'],
            ['#12c2e9', '#c471ed'],
            ['#f64f59', '#c471ed'],
            ['#43cbff', '#9708cc'],
            ['#ffecd2', '#fcb69f'],
            ['#a18cd1', '#fbc2eb'],
        ],
        todayDot: ['#fff', '#fffde4'],
        menuBg: '#160025',
        menuText: '#e0c3fc',
    },
    forest: {
        key: 'forest',
        name: '🌿 Forest',
        background: '#0d1f0d',
        headerText: '#c8e6c9',
        subText: '#81c784',
        dotPalette: [
            ['#43a047', '#388e3c'],
            ['#66bb6a', '#43a047'],
            ['#26a69a', '#00897b'],
            ['#8bc34a', '#7cb342'],
            ['#4db6ac', '#26a69a'],
            ['#a5d6a7', '#81c784'],
            ['#80cbc4', '#4db6ac'],
            ['#c5e1a5', '#aed581'],
            ['#4caf50', '#388e3c'],
            ['#9ccc65', '#7cb342'],
            ['#80deea', '#4dd0e1'],
            ['#dce775', '#cddc39'],
        ],
        todayDot: ['#ffee58', '#fdd835'],
        menuBg: '#1b3a1b',
        menuText: '#c8e6c9',
    },
};

const THEME_STORAGE_KEY = '@oneyear_theme';

type ThemeContextType = {
    theme: Theme;
    setTheme: (key: ThemeKey) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: THEMES.default,
    setTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(THEMES.default);

    useEffect(() => {
        const saved = storage.getString(THEME_STORAGE_KEY);
        if (saved && THEMES[saved as ThemeKey]) {
            setThemeState(THEMES[saved as ThemeKey]);
        }
    }, []);

    const setTheme = (key: ThemeKey) => {
        setThemeState(THEMES[key]);
        storage.set(THEME_STORAGE_KEY, key);
    };
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
