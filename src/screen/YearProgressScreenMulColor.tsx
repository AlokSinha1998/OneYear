import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    AppState,
    AppStateStatus,
    useWindowDimensions,
    Modal,
    Linking,
    Share,
    Platform,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";
import { captureRef } from "react-native-view-shot";

import DayProgressBar from "./component/module/DayProgressBar";
import ThreeDLoaderWithModal from "./component/module/ThreeDLoaderWithModal";
import DayStatsModal from "./component/module/DayStatsModal";
import RateUsModal from "./component/module/RateUsModal";
import ThemeSelectorModal from "./component/module/ThemeSelectorModal";
import NotificationSettingsModal from "./component/module/NotificationSettingsModal";
import GoalEditorModal from "./component/module/GoalEditorModal";
import { useTheme } from "../context/ThemeContext";
import { useAppOpenTracker } from "../hooks/useAppOpenTracker";
import { useGoals, Goal } from "../hooks/useGoals";

/* ===================== TYPES ===================== */

type YearData = {
    year: number;
    totalDays: 365 | 366;
    todayIndex: number | null;
    gonePercent: number | null;
    leftPercent: number | null;
};

/* ===================== DATE LOGIC ===================== */

const isLeapYear = (year: number): boolean =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
        date.getTime() -
        start.getTime() +
        (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000;
    return Math.floor(diff / 86400000);
};

const getYearData = (year: number): YearData => {
    const now = new Date();
    const isCurrentYear = year === now.getFullYear();
    const totalDays: 365 | 366 = isLeapYear(year) ? 366 : 365;
    const todayIndex = isCurrentYear ? getDayOfYear(now) : null;
    const gone =
        todayIndex !== null ? +(todayIndex / totalDays * 100).toFixed(2) : null;
    return {
        year,
        totalDays,
        todayIndex,
        gonePercent: gone,
        leftPercent: gone !== null ? +(100 - gone).toFixed(2) : null,
    };
};

/* ===================== DOT ===================== */

type DayDotProps = {
    index: number;
    todayIndex: number | null;
    size: number;
    colors: [string, string];
    todayColors: [string, string];
    onPress: (index: number) => void;
    onLongPress: (index: number) => void;
    goal?: Goal;
};

const DayDot: React.FC<DayDotProps> = ({
    index,
    todayIndex,
    size,
    colors,
    todayColors,
    onPress,
    onLongPress,
    goal,
}) => {
    const pulse = useSharedValue<number>(1);
    const isToday = index === todayIndex;
    const isPast = todayIndex && index < todayIndex;
    const isFuture = todayIndex && index > todayIndex;

    const bubble1Scale = useSharedValue<number>(0);
    const bubble1Opacity = useSharedValue<number>(0);
    const bubble2Scale = useSharedValue<number>(0);
    const bubble2Opacity = useSharedValue<number>(0);
    const bubble3Scale = useSharedValue<number>(0);
    const bubble3Opacity = useSharedValue<number>(0);

    useEffect(() => {
        if (isToday) {
            pulse.value = withRepeat(withTiming(1.15, { duration: 1500 }), -1, true);
            bubble1Scale.value = withRepeat(withTiming(2, { duration: 2000 }), -1, false);
            bubble1Opacity.value = withRepeat(withTiming(0, { duration: 2000 }), -1, false);
            setTimeout(() => {
                bubble2Scale.value = withRepeat(withTiming(2.2, { duration: 2500 }), -1, false);
                bubble2Opacity.value = withRepeat(withTiming(0, { duration: 2500 }), -1, false);
            }, 700);
            setTimeout(() => {
                bubble3Scale.value = withRepeat(withTiming(1.8, { duration: 2200 }), -1, false);
                bubble3Opacity.value = withRepeat(withTiming(0, { duration: 2200 }), -1, false);
            }, 1400);
        }
    }, [isToday]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: isToday ? pulse.value : 1 }],
    }));
    const bubble1Style = useAnimatedStyle(() => ({
        transform: [{ scale: bubble1Scale.value }],
        opacity: 0.6 - bubble1Opacity.value * 0.6,
    }));
    const bubble2Style = useAnimatedStyle(() => ({
        transform: [{ scale: bubble2Scale.value }],
        opacity: 0.5 - bubble2Opacity.value * 0.5,
    }));
    const bubble3Style = useAnimatedStyle(() => ({
        transform: [{ scale: bubble3Scale.value }],
        opacity: 0.4 - bubble3Opacity.value * 0.4,
    }));

    const gradientColors = isToday ? todayColors : colors;

    const goalColors = goal ? ([goal.color, goal.color] as [string, string]) : gradientColors;

    return (
        <TouchableOpacity
            onPress={() => onPress(index)}
            onLongPress={() => onLongPress(index)}
            delayLongPress={400}
            activeOpacity={0.7}
        >
            <View style={{ position: 'relative' }}>
                {isToday && (
                    <>
                        <Animated.View style={[{
                            position: 'absolute', width: size, height: size,
                            borderRadius: size / 2, backgroundColor: todayColors[0], top: 0, left: 0,
                        }, bubble1Style]} />
                        <Animated.View style={[{
                            position: 'absolute', width: size, height: size,
                            borderRadius: size / 2, backgroundColor: todayColors[1], top: 0, left: 0,
                        }, bubble2Style]} />
                        <Animated.View style={[{
                            position: 'absolute', width: size, height: size,
                            borderRadius: size / 2, backgroundColor: todayColors[0], top: 0, left: 0,
                        }, bubble3Style]} />
                    </>
                )}
                <Animated.View style={[{
                    width: size, height: size, borderRadius: size / 2, margin: size * 0.1,
                    shadowColor: goal ? goal.color : (isToday ? todayColors[0] : gradientColors[0]),
                    shadowOffset: { width: 0, height: isToday ? 4 : 2 },
                    shadowOpacity: isToday ? 0.6 : goal ? 0.5 : 0.25,
                    shadowRadius: isToday ? 8 : goal ? 6 : 4,
                    elevation: isToday ? 8 : goal ? 6 : 3,
                }, isToday && animatedStyle]}>
                    <LinearGradient
                        colors={goal ? goalColors : gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: '100%', height: '100%', borderRadius: size / 2,
                            justifyContent: 'center', alignItems: 'center',
                            opacity: isPast ? 0.75 : isFuture ? 0.4 : 1,
                            borderWidth: goal ? 2 : 1,
                            borderColor: goal ? goal.color : (isToday
                                ? `rgba(${todayColors[0]}, 0.5)`
                                : 'rgba(255,255,255,0.15)'),
                        }}
                    >
                        {goal ? (
                            <Text style={{ fontSize: size * 0.42 }}>{goal.emoji}</Text>
                        ) : (
                            <Text style={{
                                fontSize: size * 0.35, color: '#fff', fontWeight: '700',
                                textShadowColor: 'rgba(0,0,0,0.5)',
                                textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
                            }}>{index}</Text>
                        )}
                    </LinearGradient>
                </Animated.View>
                {/* Goal badge indicator */}
                {goal && (
                    <View style={[
                        styles.goalBadge,
                        { backgroundColor: goal.color, top: -2, right: -2 },
                    ]} />
                )}
            </View>
        </TouchableOpacity>
    );
};

/* ===================== SCREEN ===================== */

const YearProgressScreenMulColor: React.FC = () => {
    const { width, height } = useWindowDimensions();
    const { theme } = useTheme();
    const currentYear = new Date().getFullYear();
    const gridRef = useRef<View>(null);

    const [year, setYear] = useState<number>(currentYear);
    const [data, setData] = useState<YearData>(() => getYearData(currentYear));
    const [menuVisible, setMenuVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [notifModalVisible, setNotifModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [dayModalVisible, setDayModalVisible] = useState(false);
    const [goalEditorVisible, setGoalEditorVisible] = useState(false);
    const [goalEditorDay, setGoalEditorDay] = useState<number | null>(null);

    const { shouldShowRatePrompt, markAsRated, dismissPrompt } = useAppOpenTracker();
    const { goals, addGoal, removeGoal, getGoalForDay, reloadForYear } = useGoals(year);

    const headerHeight = 150;
    const availableWidth = width - 32;
    const availableHeight = height - headerHeight - 20;

    const { columns, dotSize } = React.useMemo(() => {
        let bestCols = 10;
        let bestSize = 0;
        const count = 366;
        for (let c = 8; c <= 20; c++) {
            const rows = Math.ceil(count / c);
            const sizeW = availableWidth / (c * 1.2);
            const sizeH = availableHeight / (rows * 1.2);
            const size = Math.min(sizeW, sizeH);
            if (size > bestSize) {
                bestSize = size;
                bestCols = c;
            }
        }
        return { columns: bestCols, dotSize: Math.max(8, Math.floor(bestSize * 1.90)) };
    }, [width, height]);

    /* Dot colors from theme, deterministic per index */
    const getDotColors = (index: number): [string, string] => {
        const palette = theme.dotPalette;
        const hash = (index * 7 + Math.floor(index / 3) * 5) % palette.length;
        return palette[hash];
    };

    useEffect(() => { setData(getYearData(year)); }, [year]);

    useEffect(() => {
        const now = new Date();
        const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
        const timeout = setTimeout(() => setData(getYearData(year)), nextMidnight.getTime() - now.getTime());
        return () => clearTimeout(timeout);
    }, [year]);

    useEffect(() => {
        const listener = (state: AppStateStatus) => {
            if (state === 'active') setData(getYearData(year));
        };
        const sub = AppState.addEventListener('change', listener);
        return () => sub.remove();
    }, [year]);

    /* -------- Reload goals when year changes -------- */
    useEffect(() => { reloadForYear(year); }, [year]);

    /* -------- Day dot tap (short) → Stats modal -------- */
    const handleDotPress = useCallback((index: number) => {
        setSelectedDay(index);
        setDayModalVisible(true);
    }, []);

    /* -------- Day dot long-press → Goal editor -------- */
    const handleDotLongPress = useCallback((index: number) => {
        setGoalEditorDay(index);
        setGoalEditorVisible(true);
    }, []);

    /* -------- Share -------- */
    const handleShare = async () => {
        try {
            const uri = await captureRef(gridRef, { format: 'png', quality: 0.9 });
            await Share.share({
                message: `${data.gonePercent}% of ${year} is gone — ${data.leftPercent}% remains! ⏳ Track your year with OneYear.`,
                url: uri,
                title: 'My Year Progress',
            });
        } catch (e) {
            // Fallback text-only share
            Share.share({
                message: `${data.gonePercent}% of ${year} is gone — ${data.leftPercent}% remains! ⏳ #OneYear`,
            });
        }
        setMenuVisible(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* TOP BAR */}
            <View style={[styles.topBar, { width: width * 0.95 }]}>
                {/* Menu Button */}
                <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
                    <Text style={[styles.menuIcon, { color: theme.headerText }]}>☰</Text>
                </TouchableOpacity>

                {/* Header: date + progress */}
                <View style={styles.headerCenter}>
                    <Text style={[styles.date, { color: theme.headerText }]}>
                        {new Date().toDateString().toUpperCase()}
                    </Text>
                    {data.todayIndex !== null && (
                        <Text style={[styles.progress, { color: theme.subText }]}>
                            {data.gonePercent}% gone • {data.leftPercent}% left
                        </Text>
                    )}
                </View>

                <ThreeDLoaderWithModal />
            </View>

            {/* YEAR SWITCHER */}
            <View style={styles.yearSwitcher}>
                <TouchableOpacity
                    style={styles.yearArrow}
                    onPress={() => setYear(y => y - 1)}
                >
                    <Text style={[styles.yearArrowText, { color: theme.headerText }]}>‹</Text>
                </TouchableOpacity>

                <Text style={[styles.yearText, { color: theme.headerText }]}>{year}</Text>

                <TouchableOpacity
                    style={styles.yearArrow}
                    onPress={() => setYear(y => y + 1)}
                    disabled={year >= currentYear + 1}
                >
                    <Text style={[
                        styles.yearArrowText,
                        { color: year >= currentYear + 1 ? 'rgba(255,255,255,0.2)' : theme.headerText },
                    ]}>›</Text>
                </TouchableOpacity>

                {year !== currentYear && (
                    <TouchableOpacity
                        style={styles.todayBadge}
                        onPress={() => setYear(currentYear)}
                    >
                        <Text style={styles.todayBadgeText}>Today</Text>
                    </TouchableOpacity>
                )}
            </View>

            <DayProgressBar />

            {/* GRID */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.grid}
            >
                <View ref={gridRef} style={styles.dotsContainer}>
                    {Array.from({ length: data.totalDays }, (_, i) => i + 1).map(item => (
                        <DayDot
                            key={item}
                            index={item}
                            todayIndex={data.todayIndex}
                            size={dotSize}
                            colors={getDotColors(item)}
                            todayColors={theme.todayDot}
                            onPress={handleDotPress}
                            onLongPress={handleDotLongPress}
                            goal={getGoalForDay(item)}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* ── MENU MODAL ── */}
            <Modal
                animationType="fade"
                transparent
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.menuBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.menuText }]}>Menu</Text>
                            <TouchableOpacity onPress={() => setMenuVisible(false)}>
                                <Text style={[styles.closeButton, { color: theme.menuText, opacity: 0.5 }]}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.separator} />

                        {/* Actions */}
                        <MenuAction
                            icon="🎨" label="Change Theme" sub="Customise dot colors"
                            bg="#f0ebff"
                            onPress={() => { setMenuVisible(false); setThemeModalVisible(true); }}
                            textColor={theme.menuText}
                        />
                        <MenuAction
                            icon="📤" label="Share My Progress" sub="Send to friends"
                            bg="#e3f2fd"
                            onPress={handleShare}
                            textColor={theme.menuText}
                        />
                        <MenuAction
                            icon="🔔" label="Daily Reminder" sub="Get daily progress nudges"
                            bg="#fff8e1"
                            onPress={() => { setMenuVisible(false); setNotifModalVisible(true); }}
                            textColor={theme.menuText}
                        />
                        <MenuAction
                            icon="🎯" label="My Milestones" sub="Long-press any dot to add"
                            bg="#fce4ec"
                            onPress={() => { setMenuVisible(false); }}
                            textColor={theme.menuText}
                        />

                        <View style={[styles.separator, { marginVertical: 10 }]} />
                        <Text style={[styles.sectionTitle, { color: theme.menuText }]}>More Apps from Us</Text>

                        <MenuAction
                            icon="🎨" label="Drawing Pad" sub="Unleash your creativity"
                            bg="#e8f5e9"
                            onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.drawingpad')}
                            textColor={theme.menuText}
                        />
                        <MenuAction
                            icon="🎮" label="Flip Flop Game" sub="Fun memory puzzle game"
                            bg="#fff3e0"
                            onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.flipflopgame')}
                            textColor={theme.menuText}
                        />
                        <MenuAction
                            icon="🏛️" label="My Citizen Services" sub="Citizen services app"
                            bg="#fff3e0"
                            onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.mycitizenservices')}
                            textColor={theme.menuText}
                        />
                        <MenuAction
                            icon="ℹ️" label="About Us" sub="Learn more about our team"
                            bg="#E0F7FA"
                            onPress={() => Linking.openURL('https://sites.google.com/view/privacypolicyoneyear/home')}
                            textColor={theme.menuText}
                        />
                    </View>
                </View>
            </Modal>

            {/* ── MODALS ── */}
            <ThemeSelectorModal
                visible={themeModalVisible}
                onClose={() => setThemeModalVisible(false)}
            />

            <NotificationSettingsModal
                visible={notifModalVisible}
                onClose={() => setNotifModalVisible(false)}
            />

            <DayStatsModal
                visible={dayModalVisible}
                dayIndex={selectedDay}
                totalDays={data.totalDays}
                year={year}
                onClose={() => setDayModalVisible(false)}
            />

            <GoalEditorModal
                visible={goalEditorVisible}
                dayIndex={goalEditorDay}
                year={year}
                existingGoal={goalEditorDay != null ? getGoalForDay(goalEditorDay) : undefined}
                onSave={addGoal}
                onDelete={removeGoal}
                onClose={() => setGoalEditorVisible(false)}
            />

            <RateUsModal
                visible={shouldShowRatePrompt}
                onRate={markAsRated}
                onDismiss={dismissPrompt}
            />
        </View>
    );
};

/* ===================== MENU ACTION ===================== */

const MenuAction: React.FC<{
    icon: string;
    label: string;
    sub: string;
    bg: string;
    onPress: () => void;
    textColor: string;
}> = ({ icon, label, sub, bg, onPress, textColor }) => (
    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={onPress}>
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
        </View>
        <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitle, { color: textColor }]}>{label}</Text>
            <Text style={[styles.actionSubtitle, { color: textColor, opacity: 0.5 }]}>{sub}</Text>
        </View>
    </TouchableOpacity>
);

export default YearProgressScreenMulColor;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    menuButton: {
        padding: 10,
    },
    menuIcon: {
        fontSize: 24,
    },
    headerCenter: {
        alignItems: 'center',
        flex: 1,
    },
    date: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 6,
    },
    progress: {
        marginTop: 4,
        fontSize: 13,
    },
    yearSwitcher: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        marginBottom: 2,
        gap: 10,
    },
    yearArrow: {
        padding: 6,
    },
    yearArrowText: {
        fontSize: 30,
        fontWeight: '300',
        lineHeight: 34,
    },
    yearText: {
        fontSize: 20,
        fontWeight: '700',
        minWidth: 60,
        textAlign: 'center',
    },
    todayBadge: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 50,
    },
    todayBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    grid: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 10,
        marginHorizontal: 5,
    },
    dotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    /* Menu modal */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 300,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        fontSize: 24,
        padding: 5,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        opacity: 0.5,
        marginBottom: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(128,128,128,0.06)',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 12,
    },
    goalBadge: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#000',
    },
});

