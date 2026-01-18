import React, { useEffect, useState } from "react";
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
    Image,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";
import DayProgressBar from "./component/module/DayProgressBar";

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
        todayIndex !== null
            ? +(todayIndex / totalDays * 100).toFixed(2)
            : null;

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
};

const DayDot: React.FC<DayDotProps> = ({ index, todayIndex, size }) => {
    const pulse = useSharedValue<number>(1);
    const isToday = index === todayIndex;
    const isPast = todayIndex && index < todayIndex;
    const isFuture = todayIndex && index > todayIndex;

    // Continuous dropping animation - like water drops
    const dropY = useSharedValue<number>(0);
    const dropOpacity = useSharedValue<number>(0);

    // Bubble animations - create 3 bubbles with different animations
    const bubble1Scale = useSharedValue<number>(0);
    const bubble1Opacity = useSharedValue<number>(0);
    const bubble2Scale = useSharedValue<number>(0);
    const bubble2Opacity = useSharedValue<number>(0);
    const bubble3Scale = useSharedValue<number>(0);
    const bubble3Opacity = useSharedValue<number>(0);

    useEffect(() => {
        // Continuous dropping effect - staggered delay based on index
        const initialDelay = (index % 30) * 100; // Stagger start times

        setTimeout(() => {
            // Infinite loop for continuous dripping
            dropY.value = withRepeat(
                withTiming(size * 2, {
                    duration: 1000,
                    easing: Easing.in(Easing.quad),
                }),
                -1,
                false
            );

            dropOpacity.value = withRepeat(
                withTiming(0, {
                    duration: 1000,
                    easing: Easing.out(Easing.ease),
                }),
                -1,
                false
            );
        }, initialDelay);

        if (isToday) {
            pulse.value = withRepeat(
                withTiming(1.15, { duration: 1500 }),
                -1,
                true
            );

            // Bubble 1 - grows and fades out
            bubble1Scale.value = withRepeat(
                withTiming(2, { duration: 2000 }),
                -1,
                false
            );
            bubble1Opacity.value = withRepeat(
                withTiming(0, { duration: 2000 }),
                -1,
                false
            );

            // Bubble 2 - delayed animation
            setTimeout(() => {
                bubble2Scale.value = withRepeat(
                    withTiming(2.2, { duration: 2500 }),
                    -1,
                    false
                );
                bubble2Opacity.value = withRepeat(
                    withTiming(0, { duration: 2500 }),
                    -1,
                    false
                );
            }, 700);

            // Bubble 3 - even more delayed
            setTimeout(() => {
                bubble3Scale.value = withRepeat(
                    withTiming(1.8, { duration: 2200 }),
                    -1,
                    false
                );
                bubble3Opacity.value = withRepeat(
                    withTiming(0, { duration: 2200 }),
                    -1,
                    false
                );
            }, 1400);
        }
    }, [isToday]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: isToday ? pulse.value : 1 }],
    }));

    const dropStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: dropY.value }],
        opacity: 1 - dropOpacity.value,
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

    // Generate vibrant colors for each day based on index
    const getColorForDay = (dayIndex: number): [string, string] => {
        // Rainbow color palette - vibrant gradients
        const colorPalette: [string, string][] = [
            ['#8B5CF6', '#6366F1'], // Purple to Indigo
            ['#3B82F6', '#2563EB'], // Blue
            ['#06B6D4', '#0891B2'], // Cyan
            ['#10B981', '#059669'], // Green
            ['#F59E0B', '#D97706'], // Amber
            ['#EF4444', '#DC2626'], // Red
            ['#EC4899', '#DB2777'], // Pink
            ['#8B5CF6', '#A855F7'], // Purple variant
            ['#14B8A6', '#0D9488'], // Teal
            ['#84CC16', '#65A30D'], // Lime
            ['#F97316', '#EA580C'], // Orange
            ['#6366F1', '#4F46E5'], // Indigo variant
        ];

        // Use a pseudo-random distribution based on day index to avoid repetitive patterns
        // This creates better color variety across rows and columns
        const hash = (dayIndex * 7 + Math.floor(dayIndex / 3) * 5) % colorPalette.length;
        return colorPalette[hash];
    };

    // Define gradient colors based on state
    const gradientColors = isToday
        ? ['#FCD34D', '#F59E0B'] // Special gold/amber for today
        : getColorForDay(index);

    return (
        <View style={{ position: 'relative' }}>
            {/* Animated Bubbles - only for today */}
            {isToday && (
                <>
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                backgroundColor: '#FCD34D',
                                top: 0,
                                left: 0,
                            },
                            bubble1Style,
                        ]}
                    />
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                backgroundColor: '#F59E0B',
                                top: 0,
                                left: 0,
                            },
                            bubble2Style,
                        ]}
                    />
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                backgroundColor: '#FBBF24',
                                top: 0,
                                left: 0,
                            },
                            bubble3Style,
                        ]}
                    />
                </>
            )}

            {/* Main Dot */}
            <Animated.View
                style={[
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        margin: size * 0.1,
                        // Shadow for depth (iOS) - matches gradient color
                        shadowColor: isToday ? '#F59E0B' : gradientColors[0],
                        shadowOffset: { width: 0, height: isToday ? 4 : 2 },
                        shadowOpacity: isToday ? 0.6 : 0.25,
                        shadowRadius: isToday ? 8 : 4,
                        // Elevation for Android
                        elevation: isToday ? 8 : 3,
                    },
                    isToday && animatedStyle,
                ]}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: size / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: isPast ? 0.75 : isFuture ? 0.4 : 1,
                        borderWidth: 1,
                        borderColor: isToday
                            ? 'rgba(245, 158, 11, 0.5)' // Golden border for today
                            : 'rgba(255, 255, 255, 0.15)',
                    }}
                >
                    <Text
                        style={{
                            fontSize: size * 0.35,
                            color: "#fff",
                            fontWeight: "700",
                            textShadowColor: 'rgba(0, 0, 0, 0.5)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                        }}
                    >
                        {index}
                    </Text>
                </LinearGradient>
            </Animated.View>

            {/* Continuous Water Droplet */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        bottom: -size * 0.2,
                        left: size / 2 - size * 0.15,
                        width: size * 0.3,
                        height: size * 0.3,
                        borderRadius: size * 0.15,
                        backgroundColor: gradientColors[0],
                    },
                    dropStyle,
                ]}
            />
        </View>
    );
};

/* ===================== SCREEN ===================== */

const YearProgressScreenMulColor: React.FC = () => {
    const { width, height } = useWindowDimensions();
    const currentYear = new Date().getFullYear();

    const [year, setYear] = useState<number>(currentYear);
    const [showPercent, setShowPercent] = useState<boolean>(true);
    const [data, setData] = useState<YearData>(() =>
        getYearData(currentYear)
    );
    const [modalVisible, setModalVisible] = useState(false);

    /* -------- Responsive layout math -------- */

    // Reduced header height since paddingTop was removed
    // Header includes: menu button area (~60px) + date text (~35px) + progress text (~25px) + DayProgressBar (~30px) = ~150px
    const headerHeight = 150;
    const availableWidth = width - 32; // Reduced horizontal padding
    const availableHeight = height - headerHeight - 20; // Minimal bottom padding to fill screen

    const { columns, dotSize } = React.useMemo(() => {
        let bestCols = 10;
        let bestSize = 0;
        // 366 days max
        const count = 366;

        // Try a range of columns to find the best fit
        for (let c = 8; c <= 20; c++) {
            const rows = Math.ceil(count / c);
            const sizeW = availableWidth / (c * 1.2); // 1.2 includes margin factor
            const sizeH = availableHeight / (rows * 1.2);

            // We want the largest possible dot size that fits in both dimensions
            const size = Math.min(sizeW, sizeH);

            if (size > bestSize) {
                bestSize = size;
                bestCols = c;
            }
        }
        return { columns: bestCols, dotSize: Math.max(8, Math.floor(bestSize * 1.02)) };
    }, [width, height]);

    /* -------- Recalculate when year changes -------- */

    useEffect(() => {
        setData(getYearData(year));
    }, [year]);

    /* -------- Midnight auto update -------- */

    useEffect(() => {
        const now = new Date();
        const nextMidnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0,
            0,
            1
        );

        const timeout = setTimeout(() => {
            setData(getYearData(year));
        }, nextMidnight.getTime() - now.getTime());

        return () => clearTimeout(timeout);
    }, [year]);

    /* -------- App resume safety -------- */

    useEffect(() => {
        const listener = (state: AppStateStatus) => {
            if (state === "active") {
                setData(getYearData(year));
            }
        };

        const sub = AppState.addEventListener("change", listener);
        return () => sub.remove();
    }, [year]);

    return (
        <View style={styles.container}>
            {/* Top Left Menu Button */}
            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>

            {/* HEADER */}
            <Text style={styles.date}>
                {new Date().toDateString().toUpperCase()}
            </Text>

            {showPercent && data.todayIndex !== null && (
                <Text style={styles.progress}>
                    {data.gonePercent}% gone • {data.leftPercent}% left
                </Text>
            )}
            <DayProgressBar />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.grid}
            >
                <View style={styles.dotsContainer}>
                    {Array.from({ length: data.totalDays }, (_, i) => i + 1).map((item) => (
                        <DayDot
                            key={item}
                            index={item}
                            todayIndex={data.todayIndex}
                            size={dotSize}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Modal for "More Apps" */}
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>More Apps</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>More Apps from Us</Text>

                            <TouchableOpacity
                                style={styles.actionButton}
                                activeOpacity={0.8}
                                onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.drawingpad')}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                                    <Text style={{ fontSize: 20 }}>🎨</Text>
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <Text style={styles.actionTitle}>Drawing Pad</Text>
                                    <Text style={styles.actionSubtitle}>Unleash your creativity</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                activeOpacity={0.8}
                                onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.flipflopgame')}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#fff3e0' }]}>
                                    <Text style={{ fontSize: 20 }}>🎮</Text>
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <Text style={styles.actionTitle}>Flip Flop Game</Text>
                                    <Text style={styles.actionSubtitle}>Fun memory puzzle game</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                activeOpacity={0.8}
                                onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.mycitizenservices')}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#fff3e0' }]}>
                                    <Text style={{ fontSize: 20 }}>🏛️</Text>
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <Text style={styles.actionTitle}>My Citizen Services</Text>
                                    <Text style={styles.actionSubtitle}>Citizen services app</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                activeOpacity={0.8}
                                // TODO: Replace with actual About Us URL
                                onPress={() => Linking.openURL('https://sites.google.com/view/privacypolicyoneyear/home')}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#E0F7FA' }]}>
                                    <Text style={{ fontSize: 20 }}>ℹ️</Text>
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <Text style={styles.actionTitle}>About Us</Text>
                                    <Text style={styles.actionSubtitle}>Learn more about our team</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default YearProgressScreenMulColor;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        // paddingTop: 40,
    },
    menuButton: {
        position: 'absolute',
        // top: 40,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    menuIcon: {
        color: '#fff',
        fontSize: 24,
    },
    date: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "600",
        marginTop: 10, // Added margin to clear the absolute button if needed, although it's centered
    },
    progress: {
        color: "#aaa",
        marginTop: 6,
        marginBottom: 14,
    },
    grid: {
        flexGrow: 1,
        alignItems: "center",
        paddingHorizontal: 12,
        paddingBottom: 10,
        marginHorizontal: 5,
    },
    dotsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
    },
    controls: {
        backgroundColor: 'pink',
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },
    btn: {
        color: "#FFFFF",
        fontSize: 18,
        marginHorizontal: 14,
    },
    year: {
        color: "#fff",
        fontSize: 16,
    },
    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
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
        color: '#333',
    },
    closeButton: {
        fontSize: 24,
        color: '#666',
        padding: 5,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 15,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 12,
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
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#666',
    },
});

