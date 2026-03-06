import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

type DayStatsModalProps = {
    visible: boolean;
    dayIndex: number | null;
    totalDays: number;
    year: number;
    onClose: () => void;
};

const getDayDate = (dayIndex: number, year: number): Date => {
    const date = new Date(year, 0, dayIndex);
    return date;
};

const getMonthName = (date: Date) =>
    date.toLocaleString('default', { month: 'long' });

const ordinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const DayStatsModal: React.FC<DayStatsModalProps> = ({
    visible,
    dayIndex,
    totalDays,
    year,
    onClose,
}) => {
    const { theme } = useTheme();
    if (dayIndex === null) return null;

    const date = getDayDate(dayIndex, year);
    const daysLeft = totalDays - dayIndex;
    const progressPct = ((dayIndex / totalDays) * 100).toFixed(1);
    const today = new Date();
    const currentYear = today.getFullYear();
    const isCurrentYear = currentYear === year;
    const isPastYear = year < currentYear;
    const isFutureYear = year > currentYear;

    // Calculate todayDayIndex the same way as the main screen's getDayOfYear
    const todayDayIndex = isCurrentYear
        ? (() => {
            const start = new Date(year, 0, 0);
            const diff = today.getTime() - start.getTime() +
                (start.getTimezoneOffset() - today.getTimezoneOffset()) * 60000;
            return Math.floor(diff / 86400000);
        })()
        : null;

    const isToday = todayDayIndex !== null && todayDayIndex === dayIndex;
    const isPast = isCurrentYear
        ? (todayDayIndex !== null && dayIndex < todayDayIndex)
        : isPastYear;
    const isFuture = isCurrentYear
        ? (todayDayIndex !== null && dayIndex > todayDayIndex)
        : isFutureYear;

    const weekNumber = Math.ceil(dayIndex / 7);
    const quarter = Math.ceil((date.getMonth() + 1) / 3);

    const statusLabel = isToday ? '📍 Today' : isPast ? '✅ Past' : isFuture ? '🔮 Upcoming' : '';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.card, { backgroundColor: theme.menuBg }]}>
                    {/* Day number hero */}
                    <View style={styles.heroRow}>
                        <Text style={styles.dayNumber}>{dayIndex}</Text>
                        <Text style={styles.separator}>/</Text>
                        <Text style={styles.totalDays}>{totalDays}</Text>
                    </View>

                    <Text style={[styles.dateText, { color: theme.menuText }]}>
                        {getMonthName(date)} {ordinal(date.getDate())}, {year}
                    </Text>

                    {statusLabel ? (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{statusLabel}</Text>
                        </View>
                    ) : null}

                    {/* Stats grid */}
                    <View style={styles.statsGrid}>
                        <StatItem label="Progress" value={`${progressPct}%`} icon="⏳" theme={theme} />
                        <StatItem label="Days Left" value={String(daysLeft)} icon="📅" theme={theme} />
                        <StatItem label="Week" value={`W${weekNumber}`} icon="🗓" theme={theme} />
                        <StatItem label="Quarter" value={`Q${quarter}`} icon="📊" theme={theme} />
                    </View>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const StatItem = ({
    label,
    value,
    icon,
    theme,
}: {
    label: string;
    value: string;
    icon: string;
    theme: any;
}) => (
    <View style={[styles.statItem, { backgroundColor: theme.background }]}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={[styles.statValue, { color: theme.menuText }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.menuText, opacity: 0.5 }]}>{label}</Text>
    </View>
);

export default DayStatsModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 14,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    dayNumber: {
        fontSize: 64,
        fontWeight: '800',
        color: '#F59E0B',
        lineHeight: 72,
    },
    separator: {
        fontSize: 40,
        color: '#888',
        marginHorizontal: 6,
        lineHeight: 48,
    },
    totalDays: {
        fontSize: 30,
        fontWeight: '300',
        color: '#888',
        lineHeight: 36,
    },
    dateText: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 10,
    },
    badge: {
        backgroundColor: 'rgba(245,158,11,0.15)',
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 50,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.3)',
    },
    badgeText: {
        color: '#F59E0B',
        fontSize: 13,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
        width: '100%',
    },
    statItem: {
        flex: 1,
        minWidth: '44%',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    closeBtn: {
        width: '100%',
        paddingVertical: 13,
        backgroundColor: '#F59E0B',
        borderRadius: 50,
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});
