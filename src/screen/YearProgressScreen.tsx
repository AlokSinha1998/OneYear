import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
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
} from "react-native-reanimated";

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

    useEffect(() => {
        if (isToday) {
            pulse.value = withRepeat(
                withTiming(1.8, { duration: 1200 }),
                -1,
                true
            );
        }
    }, [isToday]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: isToday ? pulse.value : 1 }],
        opacity: todayIndex && index < todayIndex ? 0.6 : 0.25,
    }));

    return (
        <Animated.View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    margin: size * 0.1,
                    backgroundColor: isToday ? "#00FF99" : "#777", // default logic
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                isToday && animatedStyle,
            ]}
        >
            <Text style={{ fontSize: size * 0.3, color: "#fff", fontWeight: "600" }}>
                {index}
            </Text>
        </Animated.View>
    );
};

/* ===================== SCREEN ===================== */

const OneYearScreen: React.FC = () => {
    const { width, height } = useWindowDimensions();
    const currentYear = new Date().getFullYear();

    const [year, setYear] = useState<number>(currentYear);
    const [showPercent, setShowPercent] = useState<boolean>(true);
    const [data, setData] = useState<YearData>(() =>
        getYearData(currentYear)
    );
    const [modalVisible, setModalVisible] = useState(false);

    /* -------- Responsive layout math -------- */

    const headerHeight = 120; // Estimated header height
    const availableWidth = width - 20; // minimal horizontal padding
    const availableHeight = height - headerHeight - 20; // minimal vertical padding

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

        // slight reduction to ensure it fits without rounding issues
        return { columns: bestCols, dotSize: Math.floor(bestSize * 0.95) };
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


            <FlatList<number>
                key={columns}
                data={Array.from({ length: data.totalDays }, (_, i) => i + 1)}
                keyExtractor={(item) => item.toString()}
                numColumns={columns}
                scrollEnabled={false}
                contentContainerStyle={styles.grid}
                renderItem={({ item }) => (
                    <DayDot
                        index={item}
                        todayIndex={data.todayIndex}
                        size={dotSize}
                    />
                )}
            />

            {/* Modal for "More Apps" */}
            <Modal
                animationType="slide"
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

export default OneYearScreen;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        paddingTop: 40,
    },
    menuButton: {
        position: 'absolute',
        top: 40,
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
        alignItems: "center",
        marginHorizontal: 20
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

