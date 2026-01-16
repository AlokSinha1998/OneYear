import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const BAR_WIDTH = width * 0.9;

/* -------------------- LOGIC -------------------- */

const getDayProgress = (): number => {
    const now = new Date();
    const seconds =
        now.getHours() * 3600 +
        now.getMinutes() * 60 +
        now.getSeconds();

    return seconds / 86400; // 0 → 1
};

const generateSafeColor = (): string => {
    const forbidden = ["#000000", "#ffffff"];

    let color = "#000000";

    while (forbidden.includes(color.toLowerCase())) {
        color =
            "#" +
            Math.floor(Math.random() * 0xffffff)
                .toString(16)
                .padStart(6, "0");
    }

    return color;
};

/* -------------------- COMPONENT -------------------- */

const DayProgressBar = () => {
    const progress = useSharedValue<number>(0);

    const [completed, setCompleted] = useState<number>(0);
    const [remaining, setRemaining] = useState<number>(100);

    const [barColor] = useState<string>(generateSafeColor());

    const updateProgress = () => {
        const value = getDayProgress();
        const completedPct = +(value * 100).toFixed(2);

        setCompleted(completedPct);
        setRemaining(+(100 - completedPct).toFixed(2));

        progress.value = withTiming(value, {
            duration: 600,
        });
    };

    useEffect(() => {
        updateProgress();
        const interval = setInterval(updateProgress, 60_000);

        return () => clearInterval(interval);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        width: BAR_WIDTH * progress.value,
    }));

    return (
        <View style={styles.wrapper}>
            {/* TEXT */}
            <View style={styles.textRow}>
                <Text style={[styles.doneText]}>
                    {completed}% day completed
                </Text>
                <Text style={styles.leftText}>
                    {remaining}% left
                </Text>
            </View>

            {/* BAR */}
            <View style={styles.container}>
                <Animated.View style={[styles.fill, animatedStyle, { backgroundColor: barColor },]} />
            </View>
        </View>
    );
};

export default DayProgressBar;

const styles = StyleSheet.create({
    wrapper: {
        width: BAR_WIDTH,
        marginVertical: 12,
    },
    textRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    doneText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "500",
    },
    leftText: {
        color: "#aaa",
        fontSize: 12,
    },
    container: {
        width: "100%",
        height: 6,
        backgroundColor: "#222",
        borderRadius: 3,
        overflow: "hidden",
    },
    fill: {
        height: "100%",
        backgroundColor: "#00ff99",
    },
});